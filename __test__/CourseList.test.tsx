import "@testing-library/jest-dom";
import { jest } from "@jest/globals";
import { setupUser, render } from "./util";
import { CourseList } from "../components/CourseList";
import { Course } from "../components/DraggableCourse";
import { CourseType, DragCourseType } from "../entities/four_year_plan";
import { ItemTypes } from "../entities/Constants";
import { fireEvent, screen } from "@testing-library/react";

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

test("CourseList onDrop is called on drop", () => {
  const onDropMock = jest.fn();
  const index = render(
    <CourseList
      accept={[ItemTypes.COURSE]}
      onDrop={onDropMock}
      courses={testCourseData}
    />
  );
  expect(index.baseElement).toMatchSnapshot();
  // The outermost dive within the CourseList component
  const root = screen.getByTestId("test-root-element").children[0];

  testCourseData.forEach((c, index) => {
    fireEvent.dragStart(root.children[index]);
    fireEvent.dragEnter(root);
    fireEvent.dragOver(root);
    expect(root).toHaveStyle("background-color: darkgreen");
    fireEvent.drop(root);
    console.log(onDropMock.mock.calls);
    expect(onDropMock).toHaveBeenCalled();
    // expect(onDropMock).toHaveBeenCalledWith(c as unknown as DragCourseType);
  });
});
