import { type Context, createContext, useContext } from "react";

/**
 * a context provider to provide data to page
 * @internal
 */
export const LoaderDataContext: Context<unknown> = createContext<unknown>({});

type ContextInfer<T> = T extends (...args: never[]) => Promise<infer U> ? U
  : T extends (...args: never[]) => infer U ? U
  : T;

/**
 * a function to get data response from loader function
 *
 * ```tsx
 * export function loader(req: Request) {
 *  return req.host
 * }
 *
 * export default function() {
 *  const data = useLoaderData<typeof loader>()
 *
 *  return <div>{ data }</div>
 * }
 * ```
 * @publicApi
 */
export function useLoaderData<T>(): Exclude<ContextInfer<T>, Response> {
  return useContext(LoaderDataContext) as Exclude<ContextInfer<T>, Response>;
}
