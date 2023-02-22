import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";

import Home from "../pages/index";
import { setupUser, render } from "./util";

test("Verify Majors and Concentrations", async () => {
  const user = setupUser();
  const index = render(<Home />);
  expect(index.baseElement).toMatchSnapshot();

  const generateButton = screen.getByText(/Generate Schedule/i);
  expect(generateButton).toBeDisabled();

  await user.selectAutocomplete(/Major/i, /^Computer Science$/i);
  expect(index.baseElement).toMatchSnapshot();
  expect(generateButton).toBeDisabled();

  await user.selectAutocomplete(/Concentration/i, /Interdisciplinary/i);
  expect(index.baseElement).toMatchSnapshot();

  expect(
    screen.getByLabelText(/Use Suggested Four Year Plan/i)
  ).not.toBeChecked();

  expect(generateButton).not.toBeDisabled();
});

test("Verify Four Year Plan Not Show", async () => {
  const user = setupUser();
  const index = render(<Home />);
  expect(index.baseElement).toMatchSnapshot();

  const generateButton = screen.getByText(/Generate Schedule/i);
  expect(generateButton).toBeDisabled();

  await user.selectAutocomplete(/Major/i, /^Psychology$/i);
  expect(index.baseElement).toMatchSnapshot();
  expect(generateButton).toBeDisabled();

  await user.selectAutocomplete(/Concentration/i, /Self-Designed/i);
  expect(index.baseElement).toMatchSnapshot();

  expect(screen.queryByLabelText(/Use Suggested Four Year Plan/i)).toBeNull();

  expect(generateButton).not.toBeDisabled();
});

test("Verify adding completed course", async () => {
  const user = setupUser();
  const index = render(<Home />);
  expect(index.baseElement).toMatchSnapshot();

  const addButton = screen.getByText(/Add Course/i);
  expect(addButton).toBeDisabled();

  await user.selectAutocomplete(/Course Subject/i, /AEC/i);
  expect(index.baseElement).toMatchSnapshot();
  expect(addButton).toBeDisabled();

  await user.selectAutocomplete(/Course Number/i, /191/i);
  expect(index.baseElement).toMatchSnapshot();

  expect(addButton).not.toBeDisabled();
  await user.click(addButton);
  expect(screen.getByText(/AEC-191/i)).toBeInTheDocument();
});

test("Verify deleting completed course", async () => {
  const user = setupUser();
  const index = render(<Home />);
  expect(index.baseElement).toMatchSnapshot();

  const addButton = screen.getByText(/Add Course/i);
  expect(addButton).toBeDisabled();

  await user.selectAutocomplete(/Course Subject/i, /AEC/i);
  expect(index.baseElement).toMatchSnapshot();
  expect(addButton).toBeDisabled();

  await user.selectAutocomplete(/Course Number/i, /191/i);
  expect(index.baseElement).toMatchSnapshot();

  expect(addButton).not.toBeDisabled();
  await user.click(addButton);
  expect(screen.getByText(/AEC-191/i)).toBeInTheDocument();

  const deleteButton = screen.getByTestId("delete-icon");
  await user.click(deleteButton);
  expect(screen.queryByText(/AEC-191/i)).toBeNull();
});
