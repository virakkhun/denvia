import {
  HttpStatus,
  MIME_TYPE,
  LoaderDataContext,
  type EngineConfig,
  type RouteHandler,
} from "@virakkhun/denvia";
import { log } from "./log.ts";
import { renderToString } from "react-dom/server";

const routes = new Map<string, RouteHandler>();
const assets = new Map<string, Uint8Array<ArrayBufferLike>>();

function buildImportUrl(path: string, rootDir: string) {
  const { href } = new URL(path, `file://${rootDir}`);
  return href;
}

function buildRoutePath(path: string) {
  if (path === "/") return "index";
  return path.replace(/^\//, "").replace(/\//, ".");
}

function buildDevRoutePath(path: string, type: "api" | "page" = "page") {
  const name = buildRoutePath(path);
  return `${name}${type === "api" ? ".ts" : ".tsx"}`;
}

async function resolveRoutes(dir: string, rootDir: string) {
  for await (const entry of Deno.readDir(dir)) {
    const routeName = `${dir}/${entry.name}`;
    if (entry.isDirectory) {
      resolveRoutes(routeName, rootDir);
    } else {
      const key = routeName
        .replace(/.*(routes\/)/g, "")
        .replace(/\.tsx?/, "")
        .replace("/index", "");
      const url = buildImportUrl(`${dir}/${entry.name}`, rootDir);
      const mod: RouteHandler = await import(url);
      if (!mod.default && !mod.loader)
        throw new Error(
          `${key} does not export default page or loader function`,
        );
      routes.set(key, mod);
    }
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

async function engine(config: EngineConfig) {
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

        return new Promise((resolve) => {
          const resp = new Response(res, {
            headers: {
              "Content-Type": determineMimeType(pathname),
            },
          });

          resolve(resp);
        });
      }

      if (pathname.includes("/api/")) {
        const apiPath = buildRoutePath(pathname);
        const mod = routes.get(apiPath);

        if (!mod) {
          return new Response(null, {
            status: HttpStatus.NotFound,
          });
        }

        const loaderFnRes =
          mod.loader instanceof Function ? await mod.loader(request) : null;

        const res =
          loaderFnRes instanceof Promise ? await loaderFnRes : loaderFnRes;

        if (res instanceof Response) return res;

        throw res;
      }

      const routeName = buildRoutePath(pathname);
      const handler = routes.get(routeName);

      if (!handler)
        return new Response(null, {
          status: 404,
        });

      const { default: Page, loader } = handler;

      const loaderFnRes = loader instanceof Function ? loader(request) : null;
      const res =
        loaderFnRes instanceof Promise ? await loaderFnRes : loaderFnRes;

      if (res instanceof Response) return res;

      const html = renderToString(
        <LoaderDataContext.Provider value={res}>
          <Page />
        </LoaderDataContext.Provider>,
      );

      return new Response(
        `<!DOCTYPE html>
${html}
`,
        {
          headers: {
            "X-Powered-By": "denvia",
            "Content-Type": "text/html",
          },
        },
      );
    },
  };
}

function determineMimeType(fullPath: string) {
  const lastFragment = fullPath.split("/").at(-1);
  const ext = lastFragment ? lastFragment.split(".").at(-1) : MIME_TYPE.plain;
  const mime = ext ? MIME_TYPE[ext as keyof typeof MIME_TYPE] : MIME_TYPE.plain;
  return mime ?? MIME_TYPE.plain;
}

function devEngine(config: EngineConfig) {
  const root = config.rootDir;
  const routes = [root, "routes"].join("/");

  return {
    async render(request: Request): Promise<Response> {
      const { pathname } = new URL(request.url);

      if (pathname.includes("/static/")) {
        const url = buildImportUrl(`${root}${pathname}`, root);
        const resp = await fetch(url);

        if (!resp.ok) {
          return new Response(null, {
            status: HttpStatus.NotFound,
          });
        }

        return new Response(resp.body, {
          headers: {
            "Content-Type": determineMimeType(pathname),
          },
        });
      }

      if (pathname.includes("/api/")) {
        const apiPath = buildDevRoutePath(pathname, "api");
        const url = buildImportUrl(`${routes}/${apiPath}`, root);
        const { loader }: RouteHandler = await import(url);
        const loaderFnRes =
          loader instanceof Function ? await loader(request) : null;

        const res =
          loaderFnRes instanceof Promise ? await loaderFnRes : loaderFnRes;

        if (res instanceof Response) return res;

        throw res;
      }

      try {
        const routeName = buildDevRoutePath(pathname);
        const url = buildImportUrl(`${routes}/${routeName}`, root);
        const handler: RouteHandler = await import(url);

        if (!handler) {
          return new Response("hello not found", {
            status: HttpStatus.NotFound,
          });
        }

        const { default: Page, loader } = handler;

        const loaderFnRes = loader instanceof Function ? loader(request) : null;
        const res =
          loaderFnRes instanceof Promise ? await loaderFnRes : loaderFnRes;

        if (res instanceof Response) return res;

        const html = renderToString(
          <LoaderDataContext.Provider value={res}>
            <Page />
          </LoaderDataContext.Provider>,
        );

        return new Response(
          `<!DOCTYPE html>
${html}
`,
          {
            headers: {
              "X-Powered-By": "denvia",
              "Content-Type": "text/html",
            },
          },
        );
      } catch (error) {
        console.info(
          ":::log >> error:::",
          JSON.stringify({
            pathname,
          }),
        );
        throw error;
      }
    },
  };
}

/**
 * to create a server side rendering engine for both dev and production
 *
 * ```bash
 * export MODE=dev # for development
 * export MODE=production # for production
 * ```
 * create a minimal setup for the app
 * ```ts
 * const { render } = createServerSideRendering({
 *  rootDir: `${Deno.cwd()}/app`
 * })
 *
 * Deno.serve(req => render(req))
 * ```
 * @publicApi
 **/
export function createServerSideRendering(config: EngineConfig):
  | Promise<{
      render(request: Request): Promise<Response>;
    }>
  | {
      render(request: Request): Promise<Response>;
    } {
  const isRootDirEndedWithSlash = config.rootDir.endsWith("/");
  if (isRootDirEndedWithSlash) {
    throw new Error(
      `Expect root dir to not end with /, but recieve rootDir ${config.rootDir}`,
    );
  }

  const isProduction = Deno.env.get("MODE") === "production";
  return isProduction ? engine(config) : devEngine(config);
}
