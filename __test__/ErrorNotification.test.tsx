import "@testing-library/jest-dom";
import { fireEvent, screen, within } from "@testing-library/react";
import { CourseType } from "../entities/four_year_plan";
import { setupUser, render, parentEl } from "./util";
import { FourYearPlanPage } from "../components/FourYearPlanPage";

const mockCourses: CourseType[] = [
  {
    subject: "SUB",
    number: "100",
    name: "Course 1",
    semesters: "FA",
    credits: 1,
    preReq: "",
    idCourse: 1,
    repeatableForCred: false,
    category: "CAT-1",
    idCategory: 1,
    dragSource: "CourseList"
  },
  {
    subject: "SUB",
    number: "200",
    name: "Course 2",
    semesters: "",
    credits: 2,
    preReq: "SUB_100",
    idCourse: 2,
    repeatableForCred: false,
    category: "CAT-1",
    idCategory: 2,
    dragSource: "CourseList"
  }
];
test("Four Year Plan Page renders", async () => {
  const index = render(
    <FourYearPlanPage
      PassedCourseList={mockCourses}
      requirements={undefined}
      requirementsGen={undefined}
      importData={undefined}
    />
  );
  expect(index.baseElement).toMatchSnapshot();
});

test("Four Year Plan Page duplicate courses", async () => {
  const user = setupUser();
  const index = render(
    <FourYearPlanPage
      PassedCourseList={mockCourses}
      requirements={undefined}
      requirementsGen={undefined}
      importData={undefined}
    />
  );
  expect(index.baseElement).toMatchSnapshot();
  const categoryTab = screen.getByTestId("category-tab");
  await user.click(categoryTab);
  await user.selectAutocomplete("Course Category", mockCourses[0].category);

  const firstYear = parentEl(screen.getByText(/Year 1/i), "MuiAccordion");
  expect(firstYear).toBeInTheDocument();
  const fallSemester = parentEl(
    within(firstYear).getByText(/Fall/i),
    "Semester"
  );
  expect(fallSemester).toBeInTheDocument();
  const springSemester = parentEl(
    within(firstYear).getByText(/Spring/i),
    "Semester"
  );
  expect(fallSemester).toBeInTheDocument();

  const course = screen.getAllByTestId("course");
  fireEvent.dragStart(course[0]);
  fireEvent.dragEnter(fallSemester);
  fireEvent.dragOver(fallSemester);
  fireEvent.drop(fallSemester);

  fireEvent.dragStart(course[0]);
  fireEvent.dragEnter(springSemester);
  fireEvent.dragOver(springSemester);
  fireEvent.drop(springSemester);

  expect(screen.getByTestId("snackbar")).toBeInTheDocument();
});

test("Four Year Plan Page Prerequisite course", async () => {
  const user = setupUser();
  const index = render(
    <FourYearPlanPage
      PassedCourseList={mockCourses}
      requirements={undefined}
      requirementsGen={undefined}
      importData={undefined}
    />
  );
  expect(index.baseElement).toMatchSnapshot();
  const categoryTab = screen.getByTestId("category-tab");
  await user.click(categoryTab);
  await user.selectAutocomplete("Course Category", mockCourses[0].category);

  const firstYear = parentEl(screen.getByText(/Year 1/i), "MuiAccordion");
  expect(firstYear).toBeInTheDocument();
  const fallSemester = parentEl(
    within(firstYear).getByText(/Fall/i),
    "Semester"
  );
  expect(fallSemester).toBeInTheDocument();

  const course = screen.getAllByTestId("course");
  fireEvent.dragStart(course[1]);
  fireEvent.dragEnter(fallSemester);
  fireEvent.dragOver(fallSemester);
  fireEvent.drop(fallSemester);
  expect(screen.getByTestId("snackbar")).toBeInTheDocument();
});

test("Four Year Plan incompatible Season", async () => {
  const user = setupUser();
  const index = render(
    <FourYearPlanPage
      PassedCourseList={mockCourses}
      requirements={undefined}
      requirementsGen={undefined}
      importData={undefined}
    />
  );
  expect(index.baseElement).toMatchSnapshot();
  const categoryTab = screen.getByTestId("category-tab");
  await user.click(categoryTab);
  await user.selectAutocomplete("Course Category", mockCourses[0].category);

  const firstYear = parentEl(screen.getByText(/Year 1/i), "MuiAccordion");
  expect(firstYear).toBeInTheDocument();
  const springSemester = parentEl(
    within(firstYear).getByText(/Spring/i),
    "Semester"
  );
  expect(springSemester).toBeInTheDocument();

  const course = screen.getAllByTestId("course");
  fireEvent.dragStart(course[0]);
  fireEvent.dragEnter(springSemester);
  fireEvent.dragOver(springSemester);
  fireEvent.drop(springSemester);
  expect(screen.getByTestId("snackbar")).toBeInTheDocument();
});
