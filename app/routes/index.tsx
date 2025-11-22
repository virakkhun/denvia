import { useLoaderData } from "@virakkhun/denvia";
import { Fragment } from "preact";

export async function loader() {
  const res = await fetch("http://localhost:8000/api/meta");
  const data = await res.json();
  return data;
}

export default function () {
  const { hello } = useLoaderData<typeof loader>();
  return (
    <Fragment>
      <head lang="en">
        <title>
          Home
        </title>
        <link
          rel="preload"
          href="/static/css/style.css"
          as="style"
          {...{ "onload": "this.onload=null;this.rel='stylesheet'" }}
        />
      </head>
      <div>
        <h1>Hello {hello}</h1>
        <img src="/static/example.avif" />
      </div>
    </Fragment>
  );
}
