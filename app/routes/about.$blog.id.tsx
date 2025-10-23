import { useLoaderData } from "../../lib/ctx.tsx";

export function loader(_: Request, params: { blog: string; id: string }) {
  return params;
}

export default function () {
  const data = useLoaderData<typeof loader>();
  return <h1>hello {data.blog} - {data.id}</h1>;
}
