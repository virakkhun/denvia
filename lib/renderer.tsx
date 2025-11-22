import { LoaderDataContext } from "./ctx.tsx";
import type * as P from "preact";
import { renderToString } from "preact-render-to-string";

export function renderer(
  ctx: { Page: () => P.VNode; contextValue: unknown },
) {
  const html = renderToString(
    <LoaderDataContext.Provider value={ctx.contextValue}>
      <ctx.Page />
    </LoaderDataContext.Provider>,
  );

  return new Response(
    `<!DOCTYPE html>
${html}
`,
    {
      headers: {
        "X-Powered-By": "@virakkhun/denvia",
        "Content-Type": "text/html",
      },
    },
  );
}
