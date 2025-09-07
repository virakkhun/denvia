import type { ReactNode } from "react";

export interface EngineConfig {
  rootDir: string;
}

export interface RouteHandler {
  default: () => ReactNode;
  loader: (
    request: Request,
  ) => Promise<unknown> | Promise<Response> | Response | unknown;
}
