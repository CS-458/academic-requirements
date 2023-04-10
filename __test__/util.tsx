import { jest } from "@jest/globals";
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
import { User, UserMajor } from "../services/user";
import { VerifyIdTokenOptions, LoginTicket } from "google-auth-library";
import { updateClient } from "../services/login";
import { PromisedDatabase } from "promised-sqlite3";
import { setUserDb } from "../services/sql";

import "../pages/api";
import { dragAndDrop } from "./dragDrop";

interface UserExt {
  /// Select an element from an `AutoComplete` dropdown
  selectAutocomplete: typeof selectAutocomplete;
  /// Drag an element from one place to another
  drag: typeof dragAndDrop;
}

async function selectAutocomplete(
  this: UserEvent,
  label: Matcher,
  option: Matcher
): Promise<void> {
  await this.click(screen.getByTestId("test-root-element"));
  const input = screen.getByLabelText(label, { selector: "input" });
  await waitFor(async () => {
    expect(input).not.toBeDisabled();
  });
  await this.click(input);
  try {
    await this.click(
      await screen.findByText(option, undefined, { timeout: 10000 })
    );
  } catch (e) {
    const rootEl = screen.getByTestId("test-root-element");
    const popper = rootEl?.querySelector(".MuiAutocomplete-popper");
    const html = popper?.innerHTML;
    throw new Error(
      `Option ${option} was not found in dropdown.\nOptions: ${html}`
    );
  }
}

export function parentEl(el: HTMLElement, name: string): HTMLElement {
  while (!el.classList.contains(`${name}-root`)) {
    const next = el.parentElement;
    if (next == null) {
      throw new Error(`Element does not have a wrapper with name ${name}`);
    }
    el = next;
  }
  return el;
}

/// userEvent.setup(), but with some additional convience methods
export function setupUser(): UserEvent & UserExt {
  return {
    ...userEvent.setup(),
    selectAutocomplete,
    drag: dragAndDrop
  };
}

// const modules: { [key: string]: NextApiHandler | Promise<NextApiHandler> } = {};
// declare function fetch2(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
/// Executes a request against an Api Route, roughly equavelent with `fetch`.
export async function fetchApiRoute(
  url: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const res = { resolve: (_a: any) => { }, reject: (_e: any) => { } };
  const result: Promise<Response> = new Promise((resolve, reject) => {
    res.resolve = resolve;
    res.reject = reject;
  });

  let fullUrl: string | undefined;
  let path;
  let params;
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
export async function fetchApiJson(
  url: RequestInfo | URL,
  init?: RequestInit
): Promise<any> {
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
    window.localStorage.setItem("user_major", JSON.stringify(user));
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

export function setupStandaloneQuery(): void {
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
    const pos = actual.find((val, idx) => idx > i && actual[i] === val);
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

const toBeHidden: MatcherFunction<[]> = (actual) => {
  if (!(actual instanceof HTMLElement)) {
    throw new Error("actual is not an HTMLElement");
  }
  let cur = actual;
  console.log("child", cur.ariaHidden);
  while (cur.ariaHidden == null || cur.ariaHidden === "false") {
    if (cur.dataset.testid === "Semester") {
      console.log(cur.ariaHidden);
    }
    const next = cur.parentElement;
    if (next === null) {
      return {
        message: () => "Element (or parent) is not aria-hidden",
        pass: false
      };
    }
    cur = next;
  }
  return {
    message: () => "Element (or parent) is aria-hidden",
    pass: true
  };
};

expect.extend({
  toBeUnique,
  toBeHidden
});

declare module "expect" {
  interface AsymmetricMatchers {
    toBeUnique: () => void;
    toBeHidden: () => void;
  }
  interface Matchers<R> {
    toBeUnique: () => R;
    toBeHidden: () => R;
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

export function createMockToken(): void {
  updateClient((c) => {
    c.verifyIdToken = async (options: VerifyIdTokenOptions) => {
      const [test, id] = options.idToken.split(":");
      if (test !== "TEST_TOKEN") {
        throw new Error("Invalid Token");
      }
      return new LoginTicket("", {
        sub: id,
        aud: c._clientId ?? "",
        exp: Date.now() + 1000000,
        iat: Date.now() - 100,
        iss: "https://accounts.google.com",
        at_hash: ""
      });
    };
  });
}

export function mockToken(id: string): string {
  return `TEST_TOKEN:${id}`;
}

export function mockUserInfo(id: string): User {
  return {
    cred: mockToken(id),
    info: {
      sub: id,
      picture: "",
      name: id,
      email: `${id}@gmail.com`
    }
  };
}

const db = {
  db: new PromisedDatabase(),
  opened: false
};

export async function setupMockUserDB(): Promise<void> {
  createMockToken();
  setUserDb(db.db);
  if (!db.opened) {
    db.opened = true;
    await db.db.open(":memory:");
    await db.db.run(
      "CREATE TABLE `user` ( `idUser` TEXT PRIMARY KEY, `role` TEXT NOT NULL)"
    );
    await db.db.run(
      "CREATE TABLE `schedule` ( `userID` TEXT, `name` TEXT, `timestamp` DATE DEFAULT (datetime('now','localtime')), `scheduleData` TEXT NOT NULL, PRIMARY KEY(`userID`, `name`))"
    );
  }
}
