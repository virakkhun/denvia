import { LoaderDataContext } from "./ctx.tsx";
import type { VNode } from "preact";
import { renderToString } from "preact-render-to-string";

export function renderer(
  ctx: {
    Page: () => VNode;
    headers: Headers;
    contextValue: unknown;
  },
) {
  const html = renderToString(
    <LoaderDataContext.Provider value={ctx.contextValue}>
      <ctx.Page />
    </LoaderDataContext.Provider>,
  );

  const headers = ctx.headers;
  headers.append("X-Powered-By", "@virakkhun/denvia");
  headers.append("Content-Type", "text/html");

  return new Response(
    `<!DOCTYPE html>
${html}
`,
    {
      headers,
    },
  );
}
