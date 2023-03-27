import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import { Course } from "../components/DraggableCourse";
import { DragCourseType } from "../entities/four_year_plan";
import { render } from "./util";
import { ItemTypes } from "../entities/Constants";

const mockCourse: DragCourseType = {
  subject: "TEST-SUB-1",
  number: "100HON",
  name: "Course 1",
  semesters: "",
  credits: 1,
  preReq: "",
  idCourse: 294,
  repeatableForCred: false,
  idCategory: 20,
  dragSource: "CourseList",
  type: ItemTypes.COURSE,
  warningYellowColor: undefined,
  warningOrangeColor: undefined,
  warningRedColor: undefined
};

test("Draggable Course Renders", () => {
  const index = render(
    <Course
        {...mockCourse}
    />
  );
  expect(index.baseElement).toMatchSnapshot();
});

test("DraggableCourse - Yellow Warning", () => {
  const index = render(
    <Course
        {...mockCourse}
        warningYellowColor={1}
    />
  );
  expect(index.baseElement).toMatchSnapshot();
  const course = screen.getByTestId("course");
  expect(course).toHaveClass("CourseWarningYellow");
});

test("DraggableCourse - Orange Warning", () => {
  const index = render(
    <Course
        {...mockCourse}
        warningOrangeColor={1}
    />
  );
  expect(index.baseElement).toMatchSnapshot();
  const course = screen.getByTestId("course");
  expect(course).toHaveClass("CourseWarningOrange");
});

test("DraggableCourse - Red Warning", () => {
  const index = render(
    <Course
        {...mockCourse}
        warningRedColor={1}
    />
  );
  expect(index.baseElement).toMatchSnapshot();
  const course = screen.getByTestId("course");
  expect(course).toHaveClass("CourseWarningRed");
});
