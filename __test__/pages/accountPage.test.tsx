import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import { render } from "../util";
import App from "../../pages/account";

test("Test Render of the account page", async () => {
  // This is a temporary test until this page has more content
  const bar = render(<App />);
  expect(bar.baseElement).toMatchSnapshot();
  expect(screen.getByText("The Account Page")).toBeInTheDocument();
});
