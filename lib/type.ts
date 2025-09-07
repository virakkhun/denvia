import type { ReactNode } from "react";

export interface EngineConfig {
  rootDir: string;
  moduleLoader: <T>(path: string) => Promise<T>;
}

export interface RouteHandler {
  default: () => ReactNode;
  loader: (
    request: Request,
  ) => Promise<unknown> | Promise<Response> | Response | unknown;
}
