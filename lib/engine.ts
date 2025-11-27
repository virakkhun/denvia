import { HttpStatus } from "./constant.ts";
import {
  buildImportUrl,
  buildRoutePath,
  determineMimeType,
  routeMatcher,
} from "./utils.ts";
import { log } from "./log.ts";
import { renderer } from "./renderer.tsx";
import type { EngineConfig, RouteHandler } from "./type.ts";

const routes = new Map<string, RouteHandler>();
const assets = new Map<string, Uint8Array<ArrayBuffer>>();

async function resolveRoutes(dir: string, rootDir: string) {
  for await (const entry of Deno.readDir(dir)) {
    const routeName = `${dir}/${entry.name}`;

    const key = routeName
      .replace(/.*(routes\/)/g, "")
      .replace(/\.tsx?/, "")
      .replace("/index", "");
    const url = buildImportUrl(`${dir}/${entry.name}`, rootDir);
    const mod: RouteHandler = await import(url);
    if (!mod.default && !mod.loader) {
      throw new Error(`${key} does not export default page or loader function`);
    }

    routes.set(key, mod);
  }
}

async function resolveStaticAssets(root: string, dir: string) {
  for await (const entry of Deno.readDir(dir)) {
    const routeName = `${dir}/${entry.name}`;
    if (entry.isDirectory) {
      resolveStaticAssets(root, routeName);
    } else {
      const href = buildImportUrl(routeName, root);
      const resp = await fetch(href);

      const key = routeName.replace(root, "");
      const bytes = new Uint8Array(await resp.arrayBuffer());
      assets.set(key, bytes);
    }
  }
}

function modResolver(apiPath: string) {
  const mod = routes.get(apiPath);

  if (mod) {
    return {
      mod,
      params: {},
    };
  }

  const { route, params } = routeMatcher(new Set(routes.keys()), apiPath);

  if (!route) return { mod: undefined, params: {} };

  const modWithParams = routes.get(route);

  return {
    mod: modWithParams,
    params,
  };
}

export async function engine(config: EngineConfig) {
  const routesDir = [config.rootDir, "routes"].join("/");
  const staticDir = [config.rootDir, "static"].join("/");

  await resolveRoutes(routesDir, config.rootDir);
  await resolveStaticAssets(config.rootDir, staticDir);
  log(routes, assets);

  return {
    async render(request: Request): Promise<Response> {
      const { pathname } = new URL(request.url);

      if (pathname.includes("/static/")) {
        const res = assets.get(pathname);

        if (!res) {
          return new Response(null, {
            status: HttpStatus.NotFound,
          });
        }

        return new Response(res, {
          headers: {
            "Content-Type": determineMimeType(pathname),
          },
        });
      }

      if (pathname.includes("/api/")) {
        const apiPath = buildRoutePath(pathname);
        const { mod, params } = modResolver(apiPath);

        if (!mod) {
          return new Response(null, {
            status: HttpStatus.NotFound,
          });
        }

        const loaderFnRes = mod.loader instanceof Function
          ? await mod.loader(request, params)
          : null;

        const res = loaderFnRes instanceof Promise
          ? await loaderFnRes
          : loaderFnRes;

        if (res instanceof Response) return res;

        throw res;
      }

      const routeName = buildRoutePath(pathname);
      const { mod: handler, params } = modResolver(routeName);

      if (!handler) {
        return new Response(null, {
          status: 404,
        });
      }

      const { default: Page, loader, headers: headersFn } = handler;

      const loaderFnRes = loader instanceof Function
        ? loader(request, params)
        : null;
      const res = loaderFnRes instanceof Promise
        ? await loaderFnRes
        : loaderFnRes;

      if (res instanceof Response) return res;

      const headers = headersFn instanceof Function
        ? headersFn(request, params, res)
        : {};

      return renderer({
        Page,
        headers,
        contextValue: res,
      });
    },
  };
}
