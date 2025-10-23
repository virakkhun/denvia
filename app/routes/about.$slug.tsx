import { useLoaderData } from "../../lib/ctx.tsx";

export function loader(_: Request, params: { slug: string }) {
  return params;
}

export default function () {
  const data = useLoaderData<typeof loader>();
  return <h1>hello {data.slug}</h1>;
}
