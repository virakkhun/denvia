import { devEngine } from "./dev-engine.ts";
import { engine } from "./engine.ts";
import type { EngineConfig } from "./type.ts";

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
 */
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
