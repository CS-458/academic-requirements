import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import Home from "../pages/index";
import { setupUser, wrapper } from "./util";

test("Verify Majors and Concentrations", async () => {
  const user = setupUser();
  const index = render(wrapper(<Home />));
  expect(index.baseElement).toMatchSnapshot();

  const generateButton = screen.getByText(/Generate Schedule/i);
  expect(generateButton).toBeDisabled();

  await user.selectAutocomplete(/Major/i, /^Computer Science$/i);
  expect(index.baseElement).toMatchSnapshot();
  expect(generateButton).toBeDisabled();

  await user.selectAutocomplete(/Concentration/i, /Mobile Applications/i);
  expect(index.baseElement).toMatchSnapshot();
  expect(generateButton).not.toBeDisabled();
});
