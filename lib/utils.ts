import { MIME_TYPE } from "./constant.ts";

export function determineMimeType(fullPath: string) {
  const lastFragment = fullPath.split("/").at(-1);
  const ext = lastFragment ? lastFragment.split(".").at(-1) : MIME_TYPE.plain;
  const mime = ext ? MIME_TYPE[ext as keyof typeof MIME_TYPE] : MIME_TYPE.plain;
  return mime ?? MIME_TYPE.plain;
}

export function buildImportUrl(path: string, rootDir: string) {
  const { href } = new URL(path, `file://${rootDir}`);
  return href;
}

export function buildRoutePath(path: string) {
  if (path === "/") return "index";
  return path.replace(/^\//, "").replace(/\//g, ".");
}

export function buildDevRoutePath(path: string, type: "api" | "page" = "page") {
  const name = buildRoutePath(path);
  return `${name}${type === "api" ? ".ts" : ".tsx"}`;
}

export function routeMatcher(routeSet: Set<string>, key: string) {
  const params: Record<string, string> = {};
  const route = [...routeSet].find((route) => {
    const definedRoute = route.split(".");
    const incomingRoute = key.split(".");

    const isSegmentLengthEq = definedRoute.length === incomingRoute.length;
    const isMatchedEverySegment = definedRoute.every((v, idx) => {
      if (v.startsWith("$")) {
        // computed it here is kinda weird, but has to take advantage here
        const key = v.replace("$", "");
        params[key] = incomingRoute[idx];
        return true;
      }
      return v === incomingRoute[idx];
    });

    return isSegmentLengthEq && isMatchedEverySegment;
  });

  return {
    params,
    route,
  };
}
