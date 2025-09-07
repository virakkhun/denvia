import { createServerSideRendering } from "@virakkhun/denvia";

const { render } = await createServerSideRendering({
  rootDir: `${Deno.cwd()}/app`,
  moduleLoader: (path: string) => import(path),
});

Deno.serve((req) => render(req));
