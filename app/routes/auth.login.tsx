export function headers(req: Request) {
  return {
    "Set-Cookie": `url=${req.url}`,
  };
}

export default function () {
  return <div>Login page</div>;
}
