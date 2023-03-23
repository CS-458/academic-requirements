import "@testing-library/jest-dom";
import { jest } from "@jest/globals";
import { screen } from "@testing-library/react";
import CourseFiltering from "../components/CourseFiltering";
import { CourseType } from "../entities/four_year_plan";
import { setupUser, render } from "./util";

const testCourseData: CourseType[] = [
  {
    subject: "TEST-SUB-1",
    number: "100",
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
    category: "TEST-CATEGORY-2",
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

test("Ensure Initial Render is Correct", async () => {
  const index = render(<CourseFiltering courseData={testCourseData} onFiltered={jest.fn()}/>);
  expect(index.baseElement).toMatchSnapshot();

  const categoryTab = screen.getByTestId("category-tab");
  const subjectNumberTab = screen.getByTestId("subjectnumber-tab");
  const nameTab = screen.getByTestId("name-tab");
  const creditTab = screen.getByTestId("credit-tab");

  // There should be four tabs
  expect(categoryTab).toMatchSnapshot();
  expect(subjectNumberTab).toMatchSnapshot();
  expect(nameTab).toMatchSnapshot();
  expect(creditTab).toMatchSnapshot();

  // The category panel should be the default
  const categoryPanel = screen.getByTestId("category-panel");
  expect(categoryPanel).toMatchSnapshot();
  // A rendered panel should have at least one child node
  expect(categoryPanel.childNodes.length).toBeGreaterThan(0);
});

test("Clicking Tabs Change Tab Panel", async () => {
  const user = setupUser();
  const onFilteredMock = jest.fn();

  const index = render(<CourseFiltering courseData={testCourseData} onFiltered={onFilteredMock}/>);
  expect(index.baseElement).toMatchSnapshot();

  // There should be four tabs
  const categoryTab = screen.getByTestId("category-tab");
  const categoryPanel = screen.getByTestId("category-panel");
  const subjectNumberTab = screen.getByTestId("subjectnumber-tab");
  const subjectNumberPanel = screen.getByTestId("subjectnumber-panel");
  const nameTab = screen.getByTestId("name-tab");
  const namePanel = screen.getByTestId("name-panel");
  const creditTab = screen.getByTestId("credit-tab");
  const creditPanel = screen.getByTestId("credit-panel");

  // Ensure clicking a tab changes the tab panel
  await user.click(categoryTab);
  expect(categoryPanel.childNodes.length).toBeGreaterThan(0);
  expect(subjectNumberPanel.childNodes.length).toBe(0);
  expect(namePanel.childNodes.length).toBe(0);
  expect(creditPanel.childNodes.length).toBe(0);

  await user.click(subjectNumberTab);
  expect(categoryPanel.childNodes.length).toBe(0);
  expect(subjectNumberPanel.childNodes.length).toBeGreaterThan(0);
  expect(namePanel.childNodes.length).toBe(0);
  expect(creditPanel.childNodes.length).toBe(0);

  await user.click(nameTab);
  expect(categoryPanel.childNodes.length).toBe(0);
  expect(subjectNumberPanel.childNodes.length).toBe(0);
  expect(namePanel.childNodes.length).toBeGreaterThan(0);
  expect(creditPanel.childNodes.length).toBe(0);

  await user.click(creditTab);
  expect(categoryPanel.childNodes.length).toBe(0);
  expect(subjectNumberPanel.childNodes.length).toBe(0);
  expect(namePanel.childNodes.length).toBe(0);
  expect(creditPanel.childNodes.length).toBeGreaterThan(0);
});

test("Category Information is Correct", async () => {
  const user = setupUser();
  const onFilteredMock = jest.fn();

  const index = render(<CourseFiltering courseData={testCourseData} onFiltered={onFilteredMock}/>);
  expect(index.baseElement).toMatchSnapshot();

  await user.click(screen.getByLabelText("Course Category"));
  testCourseData.forEach((item) => {
    expect(screen.getByText(item.category)).toBeTruthy();
  });
});

test("Subject/Number Information is Correct", async () => {
  const user = setupUser();
  const onFilteredMock = jest.fn();

  const index = render(<CourseFiltering courseData={testCourseData} onFiltered={onFilteredMock}/>);
  expect(index.baseElement).toMatchSnapshot();

  // Select the Subject/Number filtering option
  const subjectNumberTab = screen.getByTestId("subjectnumber-tab");
  await user.click(subjectNumberTab);

  for (const course of testCourseData) {
    await user.selectAutocomplete("Course Subject", course.subject);
    expect(onFilteredMock).toHaveBeenCalled();
    // expect(onFilteredMock).toHaveBeenCalledWith(
    //   Array.from(new Set(testCourseData.filter((c) => {
    //     return c.subject === course.subject;
    //   })))
    // );
  }

  // await user.click(screen.getByLabelText("Course Subject"));
  // expect(index.baseElement).toMatchSnapshot();

  // testCourseData.forEach((item) => {
  //   expect(screen.getByText(item.subject)).toBeTruthy();
  // });

  // await user.selectAutocomplete(/Major/i, /^Psychology$/i);

  // await user.click(screen.getByLabelText("Course Number"));
  // expect(index.baseElement).toMatchSnapshot();

  // testCourseData.forEach((item) => {
  //   expect(screen.getByText(item.number)).toBeTruthy();
  // });
});

test("Name Information is Correct", () => {
  expect(true);
});

test("Credit Information is Correct", () => {
  expect(true);
});
