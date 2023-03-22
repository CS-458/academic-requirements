import "@testing-library/jest-dom";
import { screen, waitFor, within } from "@testing-library/react";
import { setupUser, render, buildLocalStorage, parentEl } from "./util";
import PassThrough from "../components/PassThrough";
import { academicDb } from "../services/sql";

test("Render Semester List", async () => {
  const db = await academicDb();
  const major = await db.get("SELECT * FROM major WHERE idMajor=2");
  const concentration = await db.get(
    "SELECT * FROM concentration WHERE idConcentration=14"
  );
  console.log(JSON.parse(concentration.fourYearPlan));
  const user = setupUser();
  buildLocalStorage({
    completed_courses: [],
    concentration: {
      idConcentration: concentration.idConcentration,
      name: concentration.name,
      fourYearPlan: concentration.fourYearPlan
    },
    major: {
      id: major.idMajor,
      name: major.name
    },
    load_four_year_plan: false
  });
  const index = render(<PassThrough showing={true} />);

  expect(index.baseElement).toMatchSnapshot();

  const firstYear = parentEl(screen.getByText(/Year 0/i), "MuiAccordion");
  expect(firstYear).toBeInTheDocument();
  const fallSemester = parentEl(
    within(firstYear).getByText(/Fall/i),
    "Semester"
  );
  expect(fallSemester).toBeInTheDocument();

  const courseList = screen.getByTestId("courseListDropTarget");

  await user.selectAutocomplete(/Select Course/i, /RESA/i);
  await user.drag(within(courseList).getByText(/ANTH-230/i), fallSemester);
  const course = within(fallSemester).getByText(/ANTH-230/i);
  expect(course).toBeInTheDocument();
  expect(index.baseElement).toMatchSnapshot();

  const springSemester = parentEl(
    within(firstYear).getByText(/Spring/i),
    "Semester"
  );
  await user.drag(course, springSemester);
  const course2 = within(springSemester).getByText(/ANTH-230/i);
  expect(course2).toBeInTheDocument();
  expect(index.baseElement).toMatchSnapshot();

  await user.drag(course2, courseList);
  expect(within(fallSemester).queryByText(/ANTH-230/i)).toBeNull();

  expect(index.baseElement).toMatchSnapshot();
}, 100000);

test("Only first year is visible", async () => {
  const db = await academicDb();
  const major = await db.get("SELECT * FROM major WHERE idMajor=2");
  const concentration = await db.get(
    "SELECT * FROM concentration WHERE idConcentration=14"
  );
  console.log(JSON.parse(concentration.fourYearPlan));
  const user = setupUser();
  buildLocalStorage({
    completed_courses: [],
    concentration: {
      idConcentration: concentration.idConcentration,
      name: concentration.name,
      fourYearPlan: concentration.fourYearPlan
    },
    major: {
      id: major.idMajor,
      name: major.name
    },
    load_four_year_plan: false
  });
  render(<PassThrough showing={true} />);

  const firstYear = parentEl(screen.getByText(/Year 0/i), "MuiAccordion");
  expect(firstYear).toBeInTheDocument();
  const fallSemester = within(firstYear).getByText(/Fall/i);
  expect(fallSemester).toBeVisible();

  const secondYear = parentEl(screen.getByText(/Year 1/i), "MuiAccordion");
  expect(secondYear).toBeInTheDocument();
  const fallSemester1 = within(secondYear).getByText(/Fall/i);
  expect(fallSemester1).not.toBeVisible();
}, 100000);
