import { createServerSideRendering } from "@virakkhun/denvia";

const { render } = await createServerSideRendering({
  rootDir: `${Deno.cwd()}/app`,
});

Deno.serve(async (req) => await render(req));
