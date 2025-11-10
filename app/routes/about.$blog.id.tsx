import { useLoaderData } from "../../lib/ctx.tsx";

export function loader(_: Request) {
  return { id: 1, blog: "hello" };
}

export default function () {
  const data = useLoaderData<typeof loader>();
  return <h1>hello {data.blog} - {data.id}</h1>;
}
