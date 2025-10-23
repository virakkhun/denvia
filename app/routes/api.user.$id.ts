export function loader(_: Request, params: Record<string, string>) {
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
