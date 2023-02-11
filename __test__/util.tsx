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
  selectAutocomplete: (label: Matcher, option: Matcher) => Promise<void>;
}

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

export async function fetchReplace(initial: string): Promise<Response> {
  if (jest.isEnvironmentTornDown()) {
    throw new Error("Environment has been torn down");
  }
  const res = { resolve: (_a: any) => {}, reject: (_e: any) => {} };
  const result: Promise<Response> = new Promise((resolve, reject) => {
    res.resolve = resolve;
    res.reject = reject;
  });
  const [url, params] = initial.split("?");
  const handler: NextApiHandler = await import(`../pages/${url}`);
  await testApiHandler({
    handler,
    url: initial,
    params: params?.split("&").reduce((a, b) => {
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
    <div data-testid="test-root-element">
      <QueryClientProvider client={new QueryClient()}>
        {children}
      </QueryClientProvider>
    </div>
  );
}
