import type { VNode } from "preact";
import type { ContextInfer } from "@virakkhun/denvia";

/**
 * otpion to create a ssr app
 * @internal
 */
export interface EngineConfig {
  rootDir: string;
}

/**
 * loader context
 */
export interface LoaderContext<P = Record<string, string>> {
  /**
   * path params if any
   */
  params: P;
}

/**
 * loader function
 */
export interface LoaderFn<R = unknown, P = Record<string, string>> {
  (request: Request, ctx: LoaderContext<P>): R;
}

/**
 * headers to be set while response the document
 */
export interface HeaderContext<T = unknown, P = Record<string, string>> {
  /**
   * the request from the client
   * @type {Request}
   */
  request: Request;
  /**
   * value passed from the loader function
   */
  loaderValue: Exclude<ContextInfer<T>, Response>;
  /**
   * path params if any
   */
  params: P;
}

export interface HeadersFn<T = unknown, P = Record<string, string>> {
  (
    ctx: HeaderContext<T, P>,
  ): Headers;
}

/**
 * route handler contain to export function
 * @internal
 */
export interface RouteHandler {
  default: () => VNode;
  loader: (
    request: Request,
    ctx: LoaderContext,
  ) => Promise<unknown> | Promise<Response> | Response | unknown;
  headers: (ctx: HeaderContext) => Headers;
}
