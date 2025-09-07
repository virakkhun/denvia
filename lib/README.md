# denvia ⚡

A Deno-powered, get inspired by Remix, file-system based routing library for building server-side rendered applications.

## 🚀 Quickstart

```bash
deno init .
deno add jsr:@virakkhun/denvia
```

Create a simple page in `app/routes/index.tsx`

```tsx
export default function Home() {
  return <div>this is homepage</div>;
}
```

Run the dev server

```bash
deno task start:dev
```

Open [http://localhost:8000 🎉](http://localhost:8000)

## 🛠Getting Started

1. Initialize a Deno project

```bash
deno init .
```

2. Add denvia

```bash
deno add jsr:@virakkhun/denvia
```

3. Configure deno.json

> [!IMPORTANT]
> create tasks and name as your preferences, but make sure to export MODE=production to run the app in production mode

```json
{
  "tasks": {
    "start:dev": "MODE=development deno -A --watch server.ts",
    "start:production": "MODE=production deno -A server.ts"
  },
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "jsxImportSourceTypes": "@types/react"
  }
}
```

- Start the development server

```bash
deno task start:dev
```

## 📂 Directory Structure

```bash
.
├── app
│   ├── routes # pages & API routes
│   └── static # static files
├── deno.json
├── deno.lock
└── server.ts # entry point
```

- `routes` is where pages, API function are located
  - Page example

  ```tsx
  // index.tsx
  export default function () {
    return <div>this is homepage</div>;
  }
  ```

  - API example

  ```ts
  //api.login.ts
  export function loader(req: Request) {
    return new Response("this is an api route");
  }
  ```

> `static` static live here
> `server.ts` minimal app entry point

```ts
import { createServerSideRendering } from "@virakkhun/denvia";

const { render } = await createServerSideRendering({
  rootDir: `${Deno.cwd()}/app`,
});

Deno.serve((req) => render(req));
```

## ✨ Features

- 📂 File-system based routing
- 🔌 API routes (loader(req: Request))
- 🖼 Static file serving
- ⚡ Zero config — just server.ts

💡 Why Denvia?

- Declarative dependencies → pages only ship what they import
- Minimal boilerplate → filesystem first, no extra setup
- Built for Deno → native APIs
