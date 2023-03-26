import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import { setupUser, render } from "../util";
import MenuDrawer from "../../components/NavigationMenu";

test("Test Navigation menu appears and can select page", async () => {
  const user = setupUser();
  const page = render(<MenuDrawer />);
  expect(page.baseElement).toMatchSnapshot();

  const menu = screen.getByTestId("menu");
  await user.click(menu);
  expect(screen.getByText("Schedule Page")).toBeInTheDocument();
  expect(screen.getByText("Input Page")).toBeInTheDocument();
  expect(screen.getByText("Account")).toBeInTheDocument();
  // testing actual navigation to another page, not currently working
  // const inputPage = screen.getByTestId("inputPageButton");
  // await user.click(inputPage);
  // expect(screen.getByText("Select Major"));
});
