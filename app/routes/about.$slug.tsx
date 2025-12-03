import { useLoaderData } from "../../lib/ctx.tsx";
import { createHeaders, createLoader } from "@virakkhun/denvia";

export const loader = createLoader(() => {
  return { hello: 1 };
});

export const headers = createHeaders<typeof loader>((ctx) => {
  const h = new Headers();

  h.append("x-now", Date.now().valueOf().toString());
  h.append("x-data", ctx.loaderValue.hello?.toString());

  return h;
});

export default function () {
  const data = useLoaderData<typeof loader>();
  return <h1>hello {data.hello}</h1>;
}
