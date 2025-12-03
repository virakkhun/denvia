import type { HeadersFn, LoaderFn } from "@virakkhun/denvia";

/**
 * A helper function to create a loader
 * @example
 * ```ts
 * export const loader = createLoader((req, ctx) => {
 *   if(req.url.includes('hack'))
 *     return new Response(null, {
 *       status: 404,
 *       headers: {
 *         'x-greet': 'hello world'
 *       }
 *     })
 *
 *   const data = await db.query('SELECT * FROM users')
 *
 *   return { data }
 * })
 * ```
 */
export function createLoader<R>(fn: LoaderFn<R>): LoaderFn<R> {
  return fn;
}

export const loader = createLoader(() => {
  return { hello: 1 };
});

export const headers = createHeaders<typeof loader>((ctx) => {
  const h = new Headers();

  h.append("x-now", Date.now().valueOf().toString());
  h.append("x-data", ctx.loaderValue.hello?.toString());

  return h;
});

/**
 * A helper function to create header for the Response
 * @note headers will be write only with document
 *
 * @example
 * ```ts
 * export const loader = createLoader(() => {
 *  return { hello: 1 };
 * });
 *
 * export const headers = createHeaders<typeof loader>((ctx) => {
 *  const h = new Headers();
 *
 *  h.append("x-now", Date.now().valueOf().toString());
 *  h.append("x-data", ctx.loaderValue.hello?.toString());
 *
 *  return h;
 * });
 * ```
 */
export function createHeaders<T = unknown, P = Record<string, string>>(
  fn: HeadersFn<T, P>,
): HeadersFn<T, P> {
  return fn;
}
