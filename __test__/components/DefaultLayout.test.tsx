import "@testing-library/jest-dom";
// import { render, screen } from "@testing-library/react";
import { screen, waitFor } from "@testing-library/react";
import { mockUserInfo, render, setupUser, userId } from "../util";
import DefaultLayout from "../../components/layout/DefaultLayout";

test("Render Default Layout", async () => {
  // const user = setupUser();
  localStorage.removeItem("google-login");
  const page = render(
    <DefaultLayout>
      <div />
    </DefaultLayout>
  );
  expect(screen.getByTestId("google-login-button")).toBeInTheDocument();
  expect(page.baseElement).toMatchSnapshot();
});

test("Render Default Layout w/user", async () => {
  const user = setupUser();
  localStorage.setItem("google-login", JSON.stringify(mockUserInfo(userId())));

  const page = render(
    <DefaultLayout>
      <div />
    </DefaultLayout>
  );

  await user.click(screen.getByTestId("account-picture"));

  expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  expect(page.baseElement).toMatchSnapshot();

  await user.click(screen.getByText(/Logout/i));

  expect(screen.getByTestId("google-login-button")).toBeInTheDocument();
});

test("Render Default Layout w/expired user", async () => {
  const token = mockUserInfo(userId());
  token.info.exp = Date.now() / 1000 - 10;
  localStorage.setItem("google-login", JSON.stringify(token));

  render(
    <DefaultLayout>
      <div />
    </DefaultLayout>
  );

  expect(screen.getByTestId("google-login-button")).toBeInTheDocument();
});

test("Render Default Layout w/expiring user", async () => {
  const token = mockUserInfo(userId());
  // Default timeout is 5000, and we need to wait at least 1000. We don't do anything else here, so it isn't an issue.
  token.info.exp = Date.now() / 1000 + 1;
  localStorage.setItem("google-login", JSON.stringify(token));

  const user = setupUser();
  const page = render(
    <DefaultLayout>
      <div />
    </DefaultLayout>
  );

  await user.click(screen.getByTestId("account-picture"));
  expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  expect(page.baseElement).toMatchSnapshot();

  await waitFor(() =>
    expect(screen.getByTestId("google-login-button")).toBeInTheDocument()
  );
});
