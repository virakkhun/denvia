import type { VNode } from "preact";

/**
 * otpion to create a ssr app
 * @internal
 */
export interface EngineConfig {
  rootDir: string;
}

/**
 * route handler contain to export function
 * @internal
 */
export interface RouteHandler {
  default: () => VNode;
  loader: (
    request: Request,
    params: Record<string, string>,
  ) => Promise<unknown> | Promise<Response> | Response | unknown;
}
