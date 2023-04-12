import "@testing-library/jest-dom";
import { screen, waitFor, within } from "@testing-library/react";
import { setupUser, render, buildLocalStorage, parentEl, fetchApiJson } from "./util";
import PassThrough from "../components/PassThrough";
import { academicDb } from "../services/sql";
import FourYearPlanPage from "../components/FourYearPlanPage";
import { CourseType, RequirementComponentType } from "../entities/four_year_plan";
import { dragAndDrop } from "./dragDrop";

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

  const firstYear = parentEl(screen.getByText(/Year 1/i), "MuiAccordion");
  expect(firstYear).toBeInTheDocument();
  const fallSemester = parentEl(
    within(firstYear).getByText(/Fall/i),
    "Semester"
  );
  expect(fallSemester).toBeInTheDocument();

  const courseList = screen.getByTestId("courseListDropTarget");

  await user.selectAutocomplete(/Course Category/i, /RESA/i);
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

  const firstYear = parentEl(screen.getByText(/Year 1/i), "MuiAccordion");
  expect(firstYear).toBeInTheDocument();
  const fallSemester = within(firstYear).getByText(/Fall/i);
  expect(fallSemester).toBeVisible();

  const secondYear = parentEl(screen.getByText(/Year 2/i), "MuiAccordion");
  expect(secondYear).toBeInTheDocument();
  const fallSemester1 = within(secondYear).getByText(/Fall/i);
  expect(fallSemester1).not.toBeVisible();
}, 100000);

test("Testing adding and Removing a year", async () => {
  const db = await academicDb();
  const major = await db.get("SELECT * FROM major WHERE idMajor=2");
  const concentration = await db.get(
    "SELECT * FROM concentration WHERE idConcentration=14"
  );
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
  const reqs: RequirementComponentType[] = await fetchApiJson(
    "/api/requirements?conid=14"
  );
  // update database reqs to the req type we use
  reqs.forEach((req) => { req.courseCountTaken = 0; req.coursesTaken = ""; req.creditCountTaken = 0; req.percentage = 0; });
  const coursesMajor: CourseType[] = await fetchApiJson(
    "/api/courses/major?majid=2"
  );

  // Get general requirements
  const reqsGen: RequirementComponentType[] = await fetchApiJson(
    "/api/requirements/gen"
  );
  // update database reqs to the req type we use
  reqs.forEach((req) => { req.courseCountTaken = 0; req.coursesTaken = ""; req.creditCountTaken = 0; req.percentage = 0; });
  // get gen ed courses
  const courses: CourseType[] = await fetchApiJson(
    "/api/courses/geneds"
  );
  const index = render(<FourYearPlanPage PassedCourseList={coursesMajor.concat(courses)} requirements={reqs} requirementsGen={reqsGen} />);

  expect(index.baseElement).toMatchSnapshot();

  const fourthYear = parentEl(screen.getByText(/Year 4/i), "MuiAccordion");
  expect(fourthYear).toBeInTheDocument();
  const fallSemester = parentEl(
    within(fourthYear).getByText(/Fall/i),
    "Semester"
  );
  const addButt = index.getByTestId("addButton");
  const removeButt = index.getByTestId("removeButton");
  expect(fallSemester).toBeInTheDocument();
  expect(addButt).toBeInTheDocument();
  expect(removeButt).toBeInTheDocument();
  await user.click(addButt);
  const fifthYear = parentEl(screen.getByText(/Year 5/i), "MuiAccordion");
  const fifthFallSemester = parentEl(
    within(fifthYear).getByText(/Fall/i),
    "Semester"
  );
  expect(fifthFallSemester).toBeInTheDocument();
  await user.click(removeButt);
  expect(fifthFallSemester).not.toBeInTheDocument();
}, 100000);

test("Try removing a year that has a course", async () => {
  const db = await academicDb();
  const major = await db.get("SELECT * FROM major WHERE idMajor=2");
  const concentration = await db.get(
    "SELECT * FROM concentration WHERE idConcentration=14"
  );
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
  const reqs: RequirementComponentType[] = await fetchApiJson(
    "/api/requirements?conid=14"
  );
  // update database reqs to the req type we use
  reqs.forEach((req) => { req.courseCountTaken = 0; req.coursesTaken = ""; req.creditCountTaken = 0; req.percentage = 0; });
  const coursesMajor: CourseType[] = await fetchApiJson(
    "/api/courses/major?majid=2"
  );

  // Get general requirements
  const reqsGen: RequirementComponentType[] = await fetchApiJson(
    "/api/requirements/gen"
  );
  // update database reqs to the req type we use
  reqs.forEach((req) => { req.courseCountTaken = 0; req.coursesTaken = ""; req.creditCountTaken = 0; req.percentage = 0; });
  // get gen ed courses
  const courses: CourseType[] = await fetchApiJson(
    "/api/courses/geneds"
  );
  const index = render(<FourYearPlanPage
    PassedCourseList={coursesMajor.concat(courses)}
    requirements={reqs}
    requirementsGen={reqsGen} />);
  expect(index.baseElement).toMatchSnapshot();

  const fourthYear = parentEl(screen.getByText(/Year 4/i), "MuiAccordion");
  expect(fourthYear).toBeInTheDocument();
  const fallSemester = parentEl(
    within(fourthYear).getByText(/Fall/i),
    "Semester"
  );

  const addButt = index.getByTestId("addButton");
  const removeButt = index.getByTestId("removeButton");
  expect(fallSemester).toBeInTheDocument();
  expect(addButt).toBeInTheDocument();
  expect(removeButt).toBeInTheDocument();

  await user.click(addButt);
  const fifthYear = parentEl(screen.getByText(/Year 5/i), "MuiAccordion");
  const fifthFallSemester = parentEl(
    within(fifthYear).getByText(/Fall/i),
    "Semester"
  );
  expect(fifthFallSemester).toBeInTheDocument();

  const categoryTab = screen.getByTestId("category-tab");
  await user.click(categoryTab);
  await user.selectAutocomplete("Course Category", "CS - Computer Science Core");

  const course = screen.getAllByTestId("course");
  await dragAndDrop(course[0], fifthFallSemester);
  const openButton = screen.getByTestId("openDrawer");
  await user.click(openButton);
  // expect(within(parentEl(screen.getByText(/CS - Computer Science Core/i), "requirement")).getByText(/9.1/i)).toBeInTheDocument();
  const reqPercentages = screen.getAllByTestId("reqPercent");
  expect(reqPercentages[0]).toContainHTML("3.3");
  expect(reqPercentages[2]).toContainHTML("9.1");
  const closeButton = screen.getByTestId("closeDrawer");
  await user.click(closeButton);
  await user.click(removeButt);
  await waitFor(() => expect(screen.getByText("Cannot remove a year that contains courses!")).toBeInTheDocument());
}, 100000);
