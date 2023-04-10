import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import Home from "../../pages/index";
import LogoLink from "../../components/layout/LogoLink";
import { setupUser, render } from "../util";
import { userMajor } from "../../services/user";
import { jest } from "@jest/globals";
// import DefaultLayout from "../components/layout/DefaultLayout";

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
}, 10000000);

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
}, 10000000);

test("Verify Select Use Four Year Plan", async () => {
  const user = setupUser();
  const index = render(<Home />);
  expect(index.baseElement).toMatchSnapshot();

  const generateButton = screen.getByText(/Generate Schedule/i);
  expect(generateButton).toBeDisabled();

  await user.selectAutocomplete(/Major/i, /^Psychology$/i);
  await user.selectAutocomplete(/Concentration/i, /Pre-Clinical/i);
  expect(index.baseElement).toMatchSnapshot();
  expect(screen.queryByLabelText(/Use Suggested Four Year Plan/i)).not.toBeNull();
  expect(generateButton).not.toBeDisabled();

  const planSwitch = screen.getByTestId("FourYearPlanSwitch");
  await user.click(planSwitch);
  expect(userMajor()?.load_four_year_plan).toBeTruthy();
  await user.click(planSwitch);
  expect(userMajor()?.load_four_year_plan).toBeFalsy();
}, 10000000);

test("Verify adding completed course", async () => {
  const user = setupUser();
  const index = render(<Home />);
  expect(index.baseElement).toMatchSnapshot();

  const addButton = screen.getByText(/Add Course/i);
  expect(addButton).toBeDisabled();

  await user.selectAutocomplete(/Course Subject/i, /ANTH/i);
  expect(index.baseElement).toMatchSnapshot();
  expect(addButton).toBeDisabled();

  await user.selectAutocomplete(/Course Number/i, /230/i);
  expect(index.baseElement).toMatchSnapshot();

  expect(addButton).not.toBeDisabled();
  await user.click(addButton);
  expect(screen.getByText(/ANTH-230/i)).toBeInTheDocument();
  expect(addButton).toBeDisabled();

  // Try adding the course a second time and expect an error message
  await user.selectAutocomplete(/Course Number/i, "230");
  expect(index.baseElement).toMatchSnapshot();

  expect(addButton).not.toBeDisabled();
  await user.click(addButton);
  expect(screen.getByTestId("error")).toBeInTheDocument();

  // Try adding a course after selecting a major
  await user.selectAutocomplete(/Major/i, /^Psychology$/i);
  await user.selectAutocomplete(/Concentration/i, /Pre-Clinical/i);
  await user.selectAutocomplete(/Course Number/i, "220");
  await user.click(addButton);
  expect(userMajor()?.completed_courses).toContain("ANTH-220");
}, 100000);

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

  await user.selectAutocomplete(/Course Subject/i, /ANTH/i);
  expect(index.baseElement).toMatchSnapshot();
  expect(addButton).toBeDisabled();

  await user.selectAutocomplete(/Course Number/i, /220/i);
  expect(index.baseElement).toMatchSnapshot();
  await user.click(addButton);
  expect(screen.getByText(/ANTH-220/i)).toBeInTheDocument();

  const deleteButton = screen.getByTestId("delete-icon-AEC-191");
  await user.click(deleteButton);
  expect(screen.queryByText(/AEC-191/i)).toBeNull();
}, 100000);

test("Verify UW-Stout logo redirects to UW-Stout site", async () => {
  const index = render(<LogoLink />);
  expect(index.baseElement).toMatchSnapshot();

  const logo = screen.getByTestId("stout-logo-link");
  expect(logo).toHaveAttribute("href", "https://www.uwstout.edu/");
  expect(logo).toHaveAttribute("target", "_blank");
}, 10000000);
