import "@testing-library/jest-dom";
import { jest } from "@jest/globals";
import { setupUser, render } from "./util";
import { CourseList } from "../components/CourseList";
import { CourseType } from "../entities/four_year_plan";
import { ItemTypes } from "../entities/Constants";

const testCourseData: CourseType[] = [
  {
    subject: "TEST-SUB-1",
    number: "100HON",
    name: "Course 1",
    semesters: "",
    credits: 1,
    preReq: "",
    idCourse: 294,
    repeatableForCred: false,
    category: "TEST-CATEGORY-1",
    idCategory: 20,
    dragSource: ""
  },
  {
    subject: "TEST-SUB-2",
    number: "200",
    name: "Course 2",
    semesters: "",
    credits: 2,
    preReq: "",
    idCourse: 295,
    repeatableForCred: false,
    category: "TEST-CATEGORY-2",
    idCategory: 20,
    dragSource: ""
  },
  {
    subject: "TEST-SUB-2",
    number: "200",
    name: "Course 2",
    semesters: "",
    credits: 2,
    preReq: "",
    idCourse: 295,
    repeatableForCred: false,
    category: "TEST-CATEGORY-3",
    idCategory: 20,
    dragSource: ""
  },
  {
    subject: "TEST-SUB-3",
    number: "300",
    name: "Course 3",
    semesters: "",
    credits: 3,
    preReq: "",
    idCourse: 296,
    repeatableForCred: false,
    category: "TEST-CATEGORY-3",
    idCategory: 20,
    dragSource: ""
  }
];

test("CourseList Renders", () => {
  const index = render(
    <CourseList
      accept={[ItemTypes.COURSE]}
      onDrop={jest.fn()}
      courses={testCourseData}
    />
  );
  expect(index.baseElement).toMatchSnapshot();
});
