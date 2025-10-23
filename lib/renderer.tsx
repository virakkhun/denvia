import { renderToString } from "react-dom/server";
import { LoaderDataContext } from "./ctx.tsx";
import type { ReactNode } from "react";

export function renderer(
  ctx: { Page: () => ReactNode; contextValue: unknown },
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
        "X-Powered-By": "denvia",
        "Content-Type": "text/html",
      },
    },
  );
}
