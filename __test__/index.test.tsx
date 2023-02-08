import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Home from "../pages/index";
import { wrapper } from "./util";

test("Verify Majors and Concentrations", async () => {
  const user = userEvent.setup();
  const index = render(wrapper(<Home />));
  expect(index.baseElement).toMatchSnapshot();

  const generateButton = screen.getByText(/Generate Schedule/i);
  expect(generateButton).toBeDisabled();

  await user.click(screen.getByLabelText(/Major/i));
  await user.click(screen.getByText(/Computer Science/i));
  expect(index.baseElement).toMatchSnapshot();
  expect(generateButton).toBeDisabled();

  await user.click(screen.getByLabelText(/Concentration/i));
  await user.click(screen.getByText(/Mobile Applications/i));
  expect(index.baseElement).toMatchSnapshot();
  expect(generateButton).not.toBeDisabled();
});
