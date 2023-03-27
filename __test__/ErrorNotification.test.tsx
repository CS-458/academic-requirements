import "@testing-library/jest-dom";
import { fireEvent, screen } from "@testing-library/react";
import { CourseType } from "../entities/four_year_plan";
import { setupUser, render } from "./util";
import FourYearPlanPage from "../components/FourYearPlanPage";

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
    category: "CAT-2",
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
  const index = render(
 <FourYearPlanPage
  PassedCourseList={mockCourses}
  requirements={undefined}
  requirementsGen={undefined}
  importData={undefined}/>
  );
  expect(index.baseElement).toMatchSnapshot();
});
