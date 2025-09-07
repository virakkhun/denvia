import { type Context, createContext, useContext } from "react";

export const LoaderDataContext: Context<unknown> = createContext<unknown>({});

type ContextInfer<T> = T extends (req: Request) => Promise<infer U>
  ? U
  : T extends (req: Request) => infer U
    ? U
    : T;

export function useLoaderData<T>(): Exclude<ContextInfer<T>, Response> {
  return useContext(LoaderDataContext) as Exclude<ContextInfer<T>, Response>;
}
