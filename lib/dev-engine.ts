import { HttpStatus } from "./constant.ts";
import {
  buildDevRoutePath,
  buildImportUrl,
  determineMimeType,
  routeMatcher,
} from "./utils.ts";
import { renderer } from "./renderer.tsx";
import type { EngineConfig, RouteHandler } from "./type.ts";

const devRoutesSet = new Set<string>();

export async function resolveDevRoutes(routePath: string) {
  // just to prevent if possible
  if (devRoutesSet.size === 0) {
    for await (const entry of Deno.readDir(routePath)) {
      devRoutesSet.add(entry.name);
    }
  }

  return devRoutesSet;
}

export async function devEngine(config: EngineConfig) {
  const root = config.rootDir;
  const routes = [root, "routes"].join("/");
  await resolveDevRoutes(routes);

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
        const loaderFnRes = loader instanceof Function
          ? await loader(request, {})
          : null;

        const res = loaderFnRes instanceof Promise
          ? await loaderFnRes
          : loaderFnRes;

        if (res instanceof Response) return res;

        throw res;
      }

      try {
        const routeName = buildDevRoutePath(pathname);
        const { route, params } = routeMatcher(devRoutesSet, routeName);
        const url = buildImportUrl(
          `${routes}/${route || routeName}`,
          root,
        );
        const handler: RouteHandler = await import(url);

        if (!handler) {
          return new Response("hello not found", {
            status: HttpStatus.NotFound,
          });
        }

        const { default: Page, loader } = handler;

        const loaderFnRes = loader instanceof Function
          ? loader(request, params)
          : null;
        const res = loaderFnRes instanceof Promise
          ? await loaderFnRes
          : loaderFnRes;

        if (res instanceof Response) return res;

        return renderer({
          Page,
          contextValue: res,
        });
      } catch (error) {
        console.info(
          ":::log >> error:::",
          JSON.stringify({
            pathname,
            error,
          }),
        );
        throw error;
      }
    },
  };
}
