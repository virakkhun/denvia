import { useLoaderData } from "@virakkhun/denvia";

export async function loader() {
  const res = await fetch("http://localhost:8000/api/meta");
  const data = await res.json();
  return data;
}

export default function () {
  const { hello } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Hello {hello}</h1>
      <img src="/static/example.avif" />
    </div>
  );
}
