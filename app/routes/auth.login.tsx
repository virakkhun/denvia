import { HeaderContext } from "@virakkhun/denvia";

export function headers({ request }: HeaderContext) {
  return {
    "Set-Cookie": `url=${request.url}`,
  };
}

export default function () {
  return <div>Login page</div>;
}
