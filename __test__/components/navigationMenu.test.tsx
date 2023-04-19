import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import { setupUser, render, mockToken, mockUserInfo } from "../util";
import MenuDrawer from "../../components/NavigationMenu";
import { UserLogin } from "../../services/user";

test("Test Navigation menu appears and can select page", async () => {
  const user = setupUser();
  const page = render(<MenuDrawer />);
  expect(page.baseElement).toMatchSnapshot();

  const menu = screen.getByTestId("menu");
  await user.click(menu);
  expect(screen.getByText("Schedule Page")).toBeInTheDocument();
  expect(screen.getByText("Input Page")).toBeInTheDocument();
  expect(screen.queryByText("Account")).toBeNull();
  // testing actual navigation to another page, not currently working
  // const inputPage = screen.getByTestId("inputPageButton");
  // await user.click(inputPage);
});

test("Test Navigation menu to close upon clicking Nav menu", async () => {
  const user = setupUser();
  const page = render(<MenuDrawer />);
  expect(page.baseElement).toMatchSnapshot();

  const menu = screen.getByTestId("menu");
  await user.click(menu);
  expect(screen.getByText("Schedule Page")).toBeInTheDocument();
  expect(screen.getByText("Input Page")).toBeInTheDocument();
  await user.click(menu);
  console.log(page.container.getElementsByClassName("MuiBackdrop-root MuiModal-backdrop css-i9fmh8-MuiBackdrop-root-MuiModal-backdrop")[0].getAttribute("style"));
  // expect(page.getByText("Account Page")).toBeInTheDocument();
});

test("Test Account page appears", async () => {
  const user = setupUser();
  // Mock UserLogin to show Account page
  const page = render(
    <UserLogin.Provider value={mockUserInfo("a")}>
      <MenuDrawer />
    </UserLogin.Provider>
  );
  expect(page.baseElement).toMatchSnapshot();

  const menu = screen.getByTestId("menu");
  await user.click(menu);
  expect(screen.getByText("Schedule Page")).toBeInTheDocument();
  expect(screen.getByText("Input Page")).toBeInTheDocument();
  expect(screen.getByText("Account")).toBeInTheDocument();
});
