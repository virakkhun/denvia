import { LoaderContext } from "@virakkhun/denvia";

export function loader(_: Request, { params }: LoaderContext) {
  return new Response(
    JSON.stringify({
      hello: `User is ${params.id}`,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}
