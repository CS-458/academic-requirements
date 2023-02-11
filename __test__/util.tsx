import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { QueryClient, QueryClientProvider } from "react-query";
import { testApiHandler } from "next-test-api-route-handler";
import { NextApiHandler } from "next";

export async function fetchReplace(initial: string): Promise<Response> {
  const res = { resolve: (_a: any) => {}, reject: (_e: any) => {} };
  const result: Promise<Response> = new Promise((resolve, reject) => {
    res.resolve = resolve;
    res.reject = reject;
  });
  const [url, params] = initial.split("?");
  await testApiHandler({
    handler: await import(`../pages/${url}`),
    url: initial,
    params: params.split("&").reduce((a, b) => {
      const [name, value] = b.split("=");
      return { ...a, [name]: value };
    }, {}),
    test: async ({ fetch }) => {
      const inner = await fetch();
      // console.error(initial, await inner.json());
      // res.reject(new Error("Failed"));
      res.resolve(inner);
    }
  });
  return await result;
}

/**
 *  Wrap Elements with QueryClient & DndProvider similar to _app.tsx
 * */
export function wrapper(children: JSX.Element | JSX.Element[]): JSX.Element {
  // @ts-expect-error Parameters are different
  window.fetch = fetchReplace;
  // <DndProvider backend={HTML5Backend}>{children}</DndProvider>
  return (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );
}
