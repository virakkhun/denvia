import type { ReactNode } from "react";

export interface EngineConfig {
  rootDir: string;
  moduleLoader: (path: string) => unknown;
}

export interface RouteHandler {
  default: () => ReactNode;
  loader: (
    request: Request,
  ) => Promise<unknown> | Promise<Response> | Response | unknown;
}
