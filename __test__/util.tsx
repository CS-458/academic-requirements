import { jest } from "@jest/globals";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { QueryClient, QueryClientProvider } from "react-query";
import { testApiHandler } from "next-test-api-route-handler";
import { NextApiHandler } from "next";
import {
  Matcher,
  screen,
  render as testRender,
  RenderResult,
  waitFor
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import { UserMajor } from "../services/user";
import "../pages/api";

interface UserExt {
  /// Select an element from an `AutoComplete` dropdown
  selectAutocomplete: (
    this: UserEvent,
    label: Matcher,
    option: Matcher
  ) => Promise<void>;
}

async function selectAutocomplete(
  this: UserEvent,
  label: Matcher,
  option: Matcher
): Promise<void> {
  await this.click(screen.getByTestId("test-root-element"));
  await this.click(await screen.findByLabelText(label, { selector: "input" }));
  await this.click(await screen.findByText(option));
}

/// userEvent.setup(), but with some additional convience methods
export function setupUser(): UserEvent & UserExt {
  return {
    ...userEvent.setup(),
    selectAutocomplete: async function(
      this: UserEvent,
      label: Matcher,
      option: Matcher
    ) {
      await this.click(screen.getByTestId("test-root-element"));
      const input = screen.getByLabelText(label, { selector: "input" });
      await waitFor(async () => {
        expect(input).not.toBeDisabled();
      });
      await this.click(input);
      try {
        await this.click(await screen.findByText(option));
      } catch (e) {
        const rootEl = screen.getByTestId("test-root-element");
        const popper = rootEl?.querySelector(".MuiAutocomplete-popper");
        const html = popper?.innerHTML;
        throw new Error(
          `Option ${option} was not found in dropdown.\nOptions: ${html}`
        );
      }
    }
  };
}

// const modules: { [key: string]: NextApiHandler | Promise<NextApiHandler> } = {};
// declare function fetch2(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
/// Executes a request against an Api Route, roughly equavelent with `fetch`.
export async function fetchApiRoute(url: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = { resolve: (_a: any) => { }, reject: (_e: any) => { } };
  const result: Promise<Response> = new Promise((resolve, reject) => {
    res.resolve = resolve;
    res.reject = reject;
  });

  let fullUrl: string | undefined = undefined;
  let path = undefined;
  let params = undefined;
  if (url instanceof URL) {
    fullUrl = url.href;
    path = url.pathname;
    params = url.search;
  } else if (typeof url === "string") {
    fullUrl = url;
    [path, params] = url.split("?");
  } else {
    fullUrl = url.url;
    [path, params] = url.url.split("?");
  }

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
    url: fullUrl,
    handler,
    params: params?.split("&").reduce((a, b) => {
      const [name, value] = b.split("=");
      return { ...a, [name]: value };
    }, {}),
    test: async ({ fetch }) => {
      const inner = await fetch(init);
      res.resolve(inner);
    }
  });
  return await result;
}

/// Calls fetchApiRoute, and decodes the response as JSON
export async function fetchApiJson(url: RequestInfo | URL, init?: RequestInit): Promise<any> {
  return await (await fetchApiRoute(url, init)).json();
}

/**
 *  Wrap Elements with QueryClient & DndProvider similar to _app.tsx
 *
 *  Also overides window.fetch to use fetchApiRoute for testing
 * */
export function render(children: JSX.Element | JSX.Element[]): RenderResult {
  window.fetch = fetchApiRoute;
  return testRender(
    <div data-testid="test-root-element">
      <QueryClientProvider client={new QueryClient()}>
        <DndProvider backend={HTML5Backend}>{children}</DndProvider>
      </QueryClientProvider>
    </div>
  );
}

const localStorage: { [key: string]: string | null } = {};

export function getMockStorage(key: string): string | null {
  return localStorage[key];
}

export function setMockStorage(key: string, value: string): void {
  localStorage[key] = value;
}

export function removeMockStorage(key: string): void {
  localStorage[key] = null;
}

export function clearMockStorage(): void {
  for (const k in localStorage) {
    localStorage[k] = null;
  }
}

/// Configure local storage and set pre-existing data in local storage
export function buildLocalStorage(user?: UserMajor): void {
  window.localStorage.getItem = getMockStorage;
  window.localStorage.setItem = setMockStorage;
  window.localStorage.removeItem = removeMockStorage;
  window.localStorage.clear = clearMockStorage;
  if (user !== undefined) {
    setMockStorage("user_major", JSON.stringify(user));
  }
}
