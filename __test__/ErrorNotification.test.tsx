import "@testing-library/jest-dom";
import { fireEvent, screen } from "@testing-library/react";
import { CourseType } from "../entities/four_year_plan";
import { setupUser, render } from "./util";
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
  importData={undefined}/>
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
  importData={undefined}/>
  );
  expect(index.baseElement).toMatchSnapshot();
  const categoryTab = screen.getByTestId("category-tab");
  await user.click(categoryTab);
  await user.selectAutocomplete("Course Category", mockCourses[0].category);

  const semester = screen.getAllByTestId("semester");
  const sem0 = semester[0];
  const sem1 = semester[1];
  const course = screen.getAllByTestId("course");
  fireEvent.dragStart(course[0]);
  fireEvent.dragEnter(sem0);
  fireEvent.dragOver(sem0);
  fireEvent.drop(sem0);

  fireEvent.dragStart(course[0]);
  fireEvent.dragEnter(sem1);
  fireEvent.dragOver(sem1);
  fireEvent.drop(sem1);

  expect(screen.getByTestId("snackbar")).toBeInTheDocument();
});

test("Four Year Plan Page Prerequisite course", async () => {
  const user = setupUser();
  const index = render(
 <FourYearPlanPage
  PassedCourseList={mockCourses}
  requirements={undefined}
  requirementsGen={undefined}
  importData={undefined}/>
  );
  expect(index.baseElement).toMatchSnapshot();
  const categoryTab = screen.getByTestId("category-tab");
  await user.click(categoryTab);
  await user.selectAutocomplete("Course Category", mockCourses[0].category);

  const semester = screen.getAllByTestId("semester");
  const sem0 = semester[0];
  const course = screen.getAllByTestId("course");
  fireEvent.dragStart(course[1]);
  fireEvent.dragEnter(sem0);
  fireEvent.dragOver(sem0);
  fireEvent.drop(sem0);
  expect(screen.getByTestId("snackbar")).toBeInTheDocument();
});

test("Four Year Plan incompatible Season", async () => {
  const user = setupUser();
  const index = render(
 <FourYearPlanPage
  PassedCourseList={mockCourses}
  requirements={undefined}
  requirementsGen={undefined}
  importData={undefined}/>
  );
  expect(index.baseElement).toMatchSnapshot();
  const categoryTab = screen.getByTestId("category-tab");
  await user.click(categoryTab);
  await user.selectAutocomplete("Course Category", mockCourses[0].category);

  const semester = screen.getAllByTestId("semester");
  const sem1 = semester[1];
  const course = screen.getAllByTestId("course");
  fireEvent.dragStart(course[0]);
  fireEvent.dragEnter(sem1);
  fireEvent.dragOver(sem1);
  fireEvent.drop(sem1);
  expect(screen.getByTestId("snackbar")).toBeInTheDocument();
});
