/* eslint-env jest */
import { jest, expect } from "@jest/globals";
import type { MatcherFunction } from "expect";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { QueryClient, QueryClientProvider, UseQueryResult } from "react-query";
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

/// Executes a request against an Api Route, roughly equavelent with `fetch`.
export async function fetchApiRoute(url: string): Promise<Response> {
  const res = { resolve: (_a: any) => { }, reject: (_e: any) => { } };
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
    url,
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
export function render(children: JSX.Element | JSX.Element[]): RenderResult {
  // @ts-expect-error Parameters are different
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

export function mockUseQuery<T>(
  _key: any,
  fetch: () => Promise<T>
): UseQueryResult<T> & { fetch: Promise<T> } {
  return {
    fetch: fetch(),
    data: undefined,
    error: null,
    isError: false,
    isIdle: false,
    isLoading: true,
    isLoadingError: false,
    isRefetchError: false,
    isSuccess: false,
    status: "loading",
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: Date.now(),
    failureCount: 0,
    errorUpdateCount: 0,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isPlaceholderData: false,
    isPreviousData: false,
    isRefetching: false,
    isStale: false,
    refetch: async (_options: any) => {
      throw new Error("");
    },
    remove: () => { }
  };
}

export function setupStandaloneQuery() {
  jest.mock("react-query", () => ({
    useQuery: mockUseQuery
  }));
}

export async function waitForQuery<T>(
  query: () => UseQueryResult<T>
): Promise<T> {
  // @ts-expect-error fetch only exists on our mock
  const temp = await query().fetch;
  return temp;
}

const toBeUnique: MatcherFunction<[]> = (actual) => {
  if (!Array.isArray(actual)) {
    throw new Error("actual is not an object");
  }
  if (actual === null) {
    return {
      message: () => "null is not an array",
      pass: false
    };
  }
  for (const i of actual) {
    const pos = actual.find((val, idx) =>
      idx > i && actual[i] === val
    );
    if (pos !== undefined) {
      return {
        message: () => `Indicies ${i}, and ${pos} are the same`,
        pass: false
      };
    }
  }
  return {
    message: () => "All elements are unique",
    pass: true
  };
};

expect.extend({
  toBeUnique
});

declare module "expect" {
  interface AsymmetricMatchers {
    toBeUnique: () => void;
  }
  interface Matchers<R> {
    toBeUnique: () => R;
  }
}

export function courseSemestersCheck(semesters: string): void {
  /*
    Available options: FA,WI,SP,SU

    semesters can start with any of the options
    then be followed by a comma and any of the options

    Note: Data such as FA,FA will match but FA,bad_data will not
  */
  // Expect the format to match
  expect(semesters).toMatch(/^(FA|WI|SP|SU)(,(FA|WI|SP|SU))*$/);
}
