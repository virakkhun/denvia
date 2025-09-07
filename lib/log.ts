import type { RouteHandler } from "./type.ts";

const status = <T>(v: T) => {
  return typeof v !== "undefined" ? "✔︎" : "x";
};

export function log(
  pages: Map<string, RouteHandler>,
  assets: Map<string, Uint8Array<ArrayBufferLike>>,
) {
  const pagesReport: Record<keyof RouteHandler, string>[] = [];
  const assetsReport: Record<"key" | "status", string>[] = [];

  for (const [key, mod] of pages) {
    pagesReport.push({
      default: key,
      loader: status(mod.loader),
    });
  }

  for (const [key, value] of assets) {
    assetsReport.push({
      key,
      status: status(value),
    });
  }

  console.log("Routes 🌀");
  console.table(pagesReport);
  console.log("Assets 🏛️");
  console.table(assetsReport);
}
