import { jest } from "@jest/globals";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { QueryClient, QueryClientProvider } from "react-query";
import { testApiHandler } from "next-test-api-route-handler";
import { NextApiHandler } from "next";
import { Matcher, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";

interface UserExt {
  /// Select an element from an `AutoComplete` dropdown
  selectAutocomplete: (
    this: UserEvent,
    label: Matcher,
    option: Matcher
  ) => Promise<void>;
}

/// userEvent.setup(), but with some additional convience methods
export function setupUser(): UserEvent & UserExt {
  return {
    ...userEvent.setup(),
    selectAutocomplete: async function (
      this: UserEvent,
      label: Matcher,
      option: Matcher
    ) {
      await this.click(
        await screen.findByLabelText(label, { selector: "input" })
      );
      await this.click(await screen.findByText(option));
    }
  };
}

/// Executes a request against an Api Route, roughly equavelent with `fetch`.
export async function fetchApiRoute(url: string): Promise<Response> {
  const res = { resolve: (_a: any) => {}, reject: (_e: any) => {} };
  const result: Promise<Response> = new Promise((resolve, reject) => {
    res.resolve = resolve;
    res.reject = reject;
  });
  const [path, params] = url.split("?");
  const handler: NextApiHandler = await import(`../pages/${path}`).catch(
    (e) => {
      if (jest.isEnvironmentTornDown()) {
        console.log("Request made after environment torn down");
      } else {
        console.error(e);
      }
    }
  );
  await testApiHandler({
    handler,
    url: url,
    params: params?.split("&").reduce((a, b) => {
      const [name, value] = b.split("=");
      return { ...a, [name]: value };
    }, {}),
    test: async ({ fetch }) => {
      const inner = await fetch();
      res.resolve(inner);
    }
  });
  return await result;
}

/// Calls fetchApiRoute, and decodes the response as JSON
export async function fetchApiJson(url: string): Promise<any> {
  return await (await fetchApiRoute(url)).json();
}

/**
 *  Wrap Elements with QueryClient & DndProvider similar to _app.tsx
 *
 *  Also overides window.fetch to use fetchApiRoute for testing
 * */
export function wrapper(children: JSX.Element | JSX.Element[]): JSX.Element {
  // @ts-expect-error Parameters are different
  window.fetch = fetchApiRoute;
  return (
    <QueryClientProvider client={new QueryClient()}>
      <DndProvider backend={HTML5Backend}>{children}</DndProvider>
    </QueryClientProvider>
  );
}
