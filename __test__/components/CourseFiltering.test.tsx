import "@testing-library/jest-dom";
import { jest } from "@jest/globals";
import { screen } from "@testing-library/react";
import CourseFiltering from "../../components/CourseFiltering";
import { CourseType } from "../../entities/four_year_plan";
import { setupUser, render } from "../util";

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

test("Ensure Initial Render is Correct", async () => {
  const index = render(<CourseFiltering courseData={testCourseData} onFiltered={jest.fn()}/>);
  expect(index.baseElement).toMatchSnapshot();

  // Get all the tab elements
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

  // There should be four tabs and four panels
  const categoryTab = screen.getByTestId("category-tab");
  const categoryPanel = screen.getByTestId("category-panel");
  const subjectNumberTab = screen.getByTestId("subjectnumber-tab");
  const subjectNumberPanel = screen.getByTestId("subjectnumber-panel");
  const nameTab = screen.getByTestId("name-tab");
  const namePanel = screen.getByTestId("name-panel");
  const creditTab = screen.getByTestId("credit-tab");
  const creditPanel = screen.getByTestId("credit-panel");

  // Ensure clicking a tab changes the tab panel
  // Note: This is a brute force approach, probably can be better automated
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

test("Category Filtering", async () => {
  const user = setupUser();
  const onFilteredMock = jest.fn();

  const index = render(<CourseFiltering courseData={testCourseData} onFiltered={onFilteredMock}/>);
  expect(index.baseElement).toMatchSnapshot();

  const categoryTab = screen.getByTestId("category-tab");

  // Select the filter by category option
  await user.click(categoryTab);

  // Loop over mock data
  for (const course of testCourseData) {
    // Select the given course's category
    await user.selectAutocomplete("Course Category", course.category);
    expect(onFilteredMock).toHaveBeenCalled();
    // Filter based on current course's category, remove duplicates
    const expectedOutput = testCourseData
      .filter(c => c.category === course.category)
      .filter((c, index, arr) => {
        return index === arr.findIndex(c2 => c.idCourse === c2.idCourse);
      });
    expect(onFilteredMock).toHaveBeenCalledWith(expectedOutput);
  }
}, 1000000);

test("Subject/Number - Subject filtering", async () => {
  const user = setupUser();
  const onFilteredMock = jest.fn();

  const index = render(<CourseFiltering courseData={testCourseData} onFiltered={onFilteredMock}/>);
  expect(index.baseElement).toMatchSnapshot();

  const subjectNumberTab = screen.getByTestId("subjectnumber-tab");

  // Select the filter by subject/number option
  await user.click(subjectNumberTab);

  for (const course of testCourseData) {
    await user.selectAutocomplete("Course Subject", course.subject);
    expect(onFilteredMock).toHaveBeenCalled();
    // Filter based on current course's subject, remove duplicates
    const expectedOutput = testCourseData
      .filter(c => c.subject === course.subject)
      .filter((c, index, arr) => {
        return index === arr.findIndex(c2 => c.idCourse === c2.idCourse);
      });
    expect(onFilteredMock).toHaveBeenCalledWith(expectedOutput);
  }
}, 1000000);

test("Subject/Number - Number filtering", async () => {
  const user = setupUser();
  const onFilteredMock = jest.fn();

  const index = render(<CourseFiltering courseData={testCourseData} onFiltered={onFilteredMock}/>);
  expect(index.baseElement).toMatchSnapshot();

  const subjectNumberTab = screen.getByTestId("subjectnumber-tab");

  // Select the filter by subject/number option
  await user.click(subjectNumberTab);

  const numberTextField = screen.getByLabelText("Course Number");

  for (const course of testCourseData) {
    // await user.selectAutocomplete("Course Number", course.number);
    await user.type(numberTextField, course.number);
    expect(onFilteredMock).toHaveBeenCalled();
    // Filter based on current course's number, remove duplicates
    const expectedOutput = testCourseData
      .filter(c => c.number.includes(course.number))
      .filter((c, index, arr) => {
        return index === arr.findIndex(c2 => c.idCourse === c2.idCourse);
      });
    expect(onFilteredMock).toHaveBeenCalledWith(expectedOutput);
    // Clear the previously typed text for the next course
    await user.clear(numberTextField);
  }
}, 1000000);

test("Subject/Number - Subject & Number", async () => {
  const user = setupUser();
  const onFilteredMock = jest.fn();

  const index = render(<CourseFiltering courseData={testCourseData} onFiltered={onFilteredMock}/>);
  expect(index.baseElement).toMatchSnapshot();

  const subjectNumberTab = screen.getByTestId("subjectnumber-tab");

  // Select the filter by subject/number option
  await user.click(subjectNumberTab);

  const numberTextField = screen.getByLabelText("Course Number");

  for (const courseForSubject of testCourseData) {
    await user.selectAutocomplete("Course Subject", courseForSubject.subject);

    for (const courseForNumber of testCourseData) {
      await user.type(numberTextField, courseForNumber.number);

      // Filter based on current course's subject & number, remove duplicates
      const expectedOutput = testCourseData
        .filter(c => {
          return (
            c.subject === courseForSubject.subject &&
            c.number.includes(courseForNumber.number)
          );
        })
        .filter((c, index, arr) => {
          return index === arr.findIndex(c2 => c.idCourse === c2.idCourse);
        });

      expect(onFilteredMock).toHaveBeenCalledWith(expectedOutput);
      await user.clear(numberTextField);
    }
  }
}, 1000000);

test("Name Filtering", async () => {
  const user = setupUser();
  const onFilteredMock = jest.fn();

  const index = render(<CourseFiltering courseData={testCourseData} onFiltered={onFilteredMock}/>);
  expect(index.baseElement).toMatchSnapshot();

  const nameTab = screen.getByTestId("name-tab");

  // Select the filter by name option
  await user.click(nameTab);
  const nameTextField = screen.getByLabelText("Course Name");

  await user.type(nameTextField, "a{Backspace}");
  expect(onFilteredMock).toHaveBeenCalledWith([]);

  for (const course of testCourseData) {
    await user.type(nameTextField, course.name);
    // Filter based on current course's name, remove duplicates
    const expectedOutput = testCourseData
      .filter(c => c.name.toLowerCase().includes(course.name.toLowerCase()))
      .filter((c, index, arr) => {
        return index === arr.findIndex(c2 => c.idCourse === c2.idCourse);
      });
    expect(onFilteredMock).toHaveBeenCalledWith(expectedOutput);
    await user.clear(nameTextField); // clear the typed text
  }
}, 1000000);

test("Credit Filtering", async () => {
  const user = setupUser();
  const onFilteredMock = jest.fn();

  const index = render(<CourseFiltering courseData={testCourseData} onFiltered={onFilteredMock}/>);
  expect(index.baseElement).toMatchSnapshot();

  const creditTab = screen.getByTestId("credit-tab");

  // Select the filter by credit option
  await user.click(creditTab);

  for (const course of testCourseData) {
    await user.selectAutocomplete("Course Credits", course.credits.toString());
    expect(onFilteredMock).toHaveBeenCalled();
    // Filter based on current course's credits, remove duplicates
    const expectedOutput = testCourseData
      .filter(c => c.credits === course.credits)
      .filter((c, index, arr) => {
        return index === arr.findIndex(c2 => c.idCourse === c2.idCourse);
      });
    expect(onFilteredMock).toHaveBeenCalledWith(expectedOutput);
  }
}, 1000000);
