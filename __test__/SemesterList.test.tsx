import "@testing-library/jest-dom";
import { jest } from "@jest/globals";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { setupUser, render, buildLocalStorage, parentEl, fetchApiJson } from "./util";
import PassThrough from "../components/PassThrough";
import { academicDb } from "../services/sql";
import FourYearPlanPage, { PassedCourseListContext } from "../components/FourYearPlanPage";
import { CourseType, RequirementComponentType, SemesterType, season } from "../entities/four_year_plan";
import { dragAndDrop } from "./dragDrop";
import { Semester } from "../components/Semester";
import DropTargetAccordian from "../components/DropAccordian";

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

test("Semester Has Suggestions", async () => {
  const user = setupUser();
  const mockSuggestedContent = {
    courses: [
      {
        credits: 3,
        name: "mock course",
        number: "999",
        semesters: "",
        subject: "COR",
        preReq: "",
        category: "cat-1",
        idCourse: 1,
        idCategory: 1,
        dragSource: "CourseList",
        repeatableForCred: false
      },
      {
        credits: 3,
        name: "mock course-repeatable",
        number: "998",
        semesters: "",
        subject: "COR",
        preReq: "",
        category: "cat-1",
        idCourse: 2,
        idCategory: 1,
        dragSource: "CourseList",
        repeatableForCred: true
      }
    ],
    requirements: ["mock-req"]
  };
  const semNum = 1;
  const index = render(
    <Semester
      accept={["course"]}
      onDrop={() => {}}
      semesterNumber={semNum}
      courses={[]}
      SemesterCredits={0}
      warningPrerequisiteCourses={[]}
      warningFallvsSpringCourses={[]}
      warningDuplicateCourses={[]}
      Warning={null}
      year={1}
      season={season.Fall}
      suggestedContent={mockSuggestedContent}
    />
  );
  expect(index.baseElement).toMatchSnapshot();
  const suggestContentBtn = screen.getByTestId(`semester${semNum}-suggestBtn`);
  // open the suggestion box
  await user.click(suggestContentBtn);
  const suggestionBox = screen.queryByTestId(`semester${semNum}-suggestPopover`);
  expect(suggestionBox).not.toBeNull();
  expect(suggestionBox).toContainHTML("Suggested Courses");
  expect(suggestionBox).toContainHTML(mockSuggestedContent.requirements[0]);
}, 100000);

test("Semester Has No Suggestions", async () => {
  const user = setupUser();
  const mockSuggestedContent = {
    courses: [],
    requirements: []
  };
  const semNum = 1;
  const index = render(
    <Semester
      accept={["course"]}
      onDrop={() => {}}
      semesterNumber={semNum}
      courses={[]}
      SemesterCredits={0}
      warningPrerequisiteCourses={[]}
      warningFallvsSpringCourses={[]}
      warningDuplicateCourses={[]}
      Warning={null}
      year={1}
      season={season.Fall}
      suggestedContent={mockSuggestedContent}
    />
  );
  expect(index.baseElement).toMatchSnapshot();
  const suggestContentBtn = screen.queryByTestId(`semester${semNum}-suggestBtn`);
  expect(suggestContentBtn).toBeNull();
}, 100000);

test("Semester Has Only Requirements Suggestions", async () => {
  const user = setupUser();
  const mockSuggestedContent = {
    courses: [],
    requirements: ["mock-req"]
  };
  const semNum = 1;
  const index = render(
    <Semester
      accept={["course"]}
      onDrop={() => {}}
      semesterNumber={semNum}
      courses={[]}
      SemesterCredits={0}
      warningPrerequisiteCourses={[]}
      warningFallvsSpringCourses={[]}
      warningDuplicateCourses={[]}
      Warning={null}
      year={1}
      season={season.Fall}
      suggestedContent={mockSuggestedContent}
    />
  );
  expect(index.baseElement).toMatchSnapshot();
  const suggestContentBtn = screen.queryByTestId(`semester${semNum}-suggestBtn`);
  expect(suggestContentBtn).not.toBeNull();
  // open the suggestion box
  if (suggestContentBtn !== null) {
    await user.click(suggestContentBtn);
  }
  const suggestionBox = screen.queryByTestId(`semester${semNum}-suggestPopover`);
  expect(suggestionBox).not.toBeNull();
  expect(suggestionBox).toContainHTML("Suggested Courses");
  expect(suggestionBox?.children.length).toBe(2);
  expect(suggestionBox).toContainHTML(mockSuggestedContent.requirements[0]);
}, 100000);

test("Semester Has Only Course Suggestions", async () => {
  const user = setupUser();
  const mockSuggestedContent = {
    courses: [
      {
        credits: 3,
        name: "mock course",
        number: "999",
        semesters: "",
        subject: "COR",
        preReq: "",
        category: "cat-1",
        idCourse: 1,
        idCategory: 1,
        dragSource: "CourseList",
        repeatableForCred: false
      },
      {
        credits: 3,
        name: "mock course-repeatable",
        number: "998",
        semesters: "",
        subject: "COR",
        preReq: "",
        category: "cat-1",
        idCourse: 2,
        idCategory: 1,
        dragSource: "CourseList",
        repeatableForCred: true
      }
    ],
    requirements: []
  };
  const semNum = 1;
  const index = render(
    <Semester
      accept={["course"]}
      onDrop={() => {}}
      semesterNumber={semNum}
      courses={[]}
      SemesterCredits={0}
      warningPrerequisiteCourses={[]}
      warningFallvsSpringCourses={[]}
      warningDuplicateCourses={[]}
      Warning={null}
      year={1}
      season={season.Fall}
      suggestedContent={mockSuggestedContent}
    />
  );
  expect(index.baseElement).toMatchSnapshot();
  const suggestContentBtn = screen.queryByTestId(`semester${semNum}-suggestBtn`);
  expect(suggestContentBtn).not.toBeNull();
  // open the suggestion box
  if (suggestContentBtn !== null) {
    await user.click(suggestContentBtn);
  }
  const suggestionBox = screen.queryByTestId(`semester${semNum}-suggestPopover`);
  expect(suggestionBox).not.toBeNull();
  expect(suggestionBox).toContainHTML("Suggested Courses");
  expect(suggestionBox?.children.length).toBe(3);
  const courses = screen.queryAllByTestId("course");
  expect(courses.length).toBe(mockSuggestedContent.courses.length);
}, 100000);

test("Semester Drag a Suggested Course", async () => {
  const user = setupUser();
  const onDropMock = jest.fn();
  const mockSuggestedContent = {
    courses: [
      {
        credits: 3,
        name: "mock course",
        number: "999",
        semesters: "",
        subject: "COR",
        preReq: "",
        category: "cat-1",
        idCourse: 1,
        idCategory: 1,
        dragSource: "CourseList",
        repeatableForCred: false
      },
      {
        credits: 3,
        name: "mock course-repeatable",
        number: "998",
        semesters: "",
        subject: "COR",
        preReq: "",
        category: "cat-1",
        idCourse: 2,
        idCategory: 1,
        dragSource: "CourseList",
        repeatableForCred: true
      }
    ],
    requirements: []
  };
  const semNum = 1;
  const index = render(
    <Semester
      accept={["course"]}
      onDrop={onDropMock}
      semesterNumber={semNum}
      courses={[]}
      SemesterCredits={0}
      warningPrerequisiteCourses={[]}
      warningFallvsSpringCourses={[]}
      warningDuplicateCourses={[]}
      Warning={null}
      year={1}
      season={season.Fall}
      suggestedContent={mockSuggestedContent}
    />
  );
  expect(index.baseElement).toMatchSnapshot();
  const baseSemester = screen.getByTestId(`semester${semNum}`);
  const suggestContentBtn = screen.getByTestId(`semester${semNum}-suggestBtn`);

  // open the suggestions
  await user.click(suggestContentBtn);
  const suggestionBox = screen.queryByTestId(`semester${semNum}-suggestPopover`);
  expect(suggestionBox).not.toBeNull();

  const courses = screen.queryAllByTestId("course");
  expect(courses.length).toBe(mockSuggestedContent.courses.length);

  // Drag a course onto a semester
  await user.drag(courses[0], baseSemester);
  expect(onDropMock).toHaveBeenCalledTimes(1);
}, 100000);

test("DropAccordion - Suggestions consider Completed Courses correctly", async () => {
  // A course is marked as complete and is repeatable (it should be listed)
  const mockPassedCourseList: CourseType[] = [
    {
      credits: 3,
      name: "mock course-repeatable",
      number: "999",
      semesters: "",
      subject: "REP",
      preReq: "",
      category: "cat-1",
      idCourse: 1,
      idCategory: 1,
      dragSource: "CourseList",
      repeatableForCred: true
    },
    {
      credits: 3,
      name: "mock course-nonrepeatable",
      number: "998",
      semesters: "",
      subject: "COR",
      preReq: "",
      category: "cat-1",
      idCourse: 2,
      idCategory: 1,
      dragSource: "CourseList",
      repeatableForCred: false
    }
  ];
  const mockSemesters: SemesterType[] = [
    {
      accepts: ["course"],
      semesterNumber: 0,
      courses: [],
      SemesterCredits: 0,
      Warning: null,
      year: 1,
      season: season.Fall
    },
    {
      accepts: ["course"],
      semesterNumber: 1,
      courses: [],
      SemesterCredits: 0,
      Warning: null,
      year: 1,
      season: season.Winter
    },
    {
      accepts: ["course"],
      semesterNumber: 2,
      courses: [],
      SemesterCredits: 0,
      Warning: null,
      year: 1,
      season: season.Spring
    },
    {
      accepts: ["course"],
      semesterNumber: 3,
      courses: [],
      SemesterCredits: 0,
      Warning: null,
      year: 1,
      season: season.Summer
    }
  ];
  buildLocalStorage({
    completed_courses: ["REP-999"],
    concentration: {
      idConcentration: -1,
      name: "Test Concentration",
      fourYearPlan: JSON.stringify({
        Major: "Test Major",
        Concentration: "Test Concentration",
        ClassPlan: {
          Semester1: {
            Courses: [
              "REP-999"
            ],
            Requirements: []
          },
          Semester2: {
            Courses: [],
            Requirements: []
          }
        }
      })
    },
    major: {
      id: -1,
      name: "Test Major"
    },
    load_four_year_plan: false
  });
  const user = setupUser();
  const index = render(
    <PassedCourseListContext.Provider value={mockPassedCourseList}>
      <DropTargetAccordian
        semesters={mockSemesters}
        year={0}
        handleDrop={() => {}}
        warningPrerequisiteCourses={[]}
        warningFallvsSpringCourses={[]}
        warningDuplicateCourses={[]}
      />
    </PassedCourseListContext.Provider>
  );
  expect(index.baseElement).toMatchSnapshot();
  // only semester 1 has a course
  const semNum = 0;
  // Open the suggestions
  const suggestContentBtn = screen.getByTestId(`semester${semNum}-suggestBtn`);
  await user.click(suggestContentBtn);
  const suggestionBox = screen.queryByTestId(`semester${semNum}-suggestPopover`);
  expect(suggestionBox).not.toBeNull();

  // Expect the completed course to be suggested
  expect(suggestionBox).toContainHTML(mockPassedCourseList[0].name);
  expect(suggestionBox).not.toContainHTML(mockPassedCourseList[1].name);
}, 100000);

// Courses available in winter/summer (only if not already suggested)
test("DropAccordion - Suggest winter/summer courses", async () => {
  // A course is marked as complete and is repeatable (it should be listed)
  const mockPassedCourseList: CourseType[] = [
    {
      credits: 3,
      name: "mock course-1",
      number: "999",
      semesters: "WI",
      subject: "REP",
      preReq: "",
      category: "cat-1",
      idCourse: 1,
      idCategory: 1,
      dragSource: "CourseList",
      repeatableForCred: false
    },
    {
      credits: 3,
      name: "mock course-2",
      number: "998",
      semesters: "SU",
      subject: "COR",
      preReq: "",
      category: "cat-1",
      idCourse: 2,
      idCategory: 1,
      dragSource: "CourseList",
      repeatableForCred: false
    },
    {
      credits: 3,
      name: "mock course-3",
      number: "997",
      semesters: "SU",
      subject: "COR",
      preReq: "",
      category: "cat-1",
      idCourse: 3,
      idCategory: 1,
      dragSource: "CourseList",
      repeatableForCred: false
    }
  ];
  const mockSemesters: SemesterType[] = [
    {
      accepts: ["course"],
      semesterNumber: 0,
      courses: [],
      SemesterCredits: 0,
      Warning: null,
      year: 1,
      season: season.Fall
    },
    {
      accepts: ["course"],
      semesterNumber: 1,
      courses: [],
      SemesterCredits: 0,
      Warning: null,
      year: 1,
      season: season.Winter
    },
    {
      accepts: ["course"],
      semesterNumber: 2,
      courses: [],
      SemesterCredits: 0,
      Warning: null,
      year: 1,
      season: season.Spring
    },
    {
      accepts: ["course"],
      semesterNumber: 3,
      courses: [],
      SemesterCredits: 0,
      Warning: null,
      year: 1,
      season: season.Summer
    }
  ];
  buildLocalStorage({
    completed_courses: [],
    concentration: {
      idConcentration: -1,
      name: "Test Concentration",
      fourYearPlan: JSON.stringify({
        Major: "Test Major",
        Concentration: "Test Concentration",
        ClassPlan: {
          Semester1: {
            Courses: [],
            Requirements: []
          },
          Semester2: {
            Courses: [],
            Requirements: []
          }
        }
      })
    },
    major: {
      id: -1,
      name: "Test Major"
    },
    load_four_year_plan: false
  });
  const user = setupUser();
  const index = render(
    <PassedCourseListContext.Provider value={mockPassedCourseList}>
      <DropTargetAccordian
        semesters={mockSemesters}
        year={0}
        handleDrop={() => {}}
        warningPrerequisiteCourses={[]}
        warningFallvsSpringCourses={[]}
        warningDuplicateCourses={[]}
      />
    </PassedCourseListContext.Provider>
  );
  expect(index.baseElement).toMatchSnapshot();
  // check winter
  let semNum = 1;
  // Open the suggestions
  let suggestContentBtn = screen.getByTestId(`semester${semNum}-suggestBtn`);
  await user.click(suggestContentBtn);
  let suggestionBox = screen.queryByTestId(`semester${semNum}-suggestPopover`);
  expect(suggestionBox).not.toBeNull();
  // Expect the winter course to be suggested
  expect(suggestionBox).toContainHTML(mockPassedCourseList[0].name);
  expect(suggestionBox).not.toContainHTML(mockPassedCourseList[1].name);

  // check summer
  semNum = 3;
  // Open the suggestions
  suggestContentBtn = screen.getByTestId(`semester${semNum}-suggestBtn`);
  await user.click(suggestContentBtn);
  suggestionBox = screen.queryByTestId(`semester${semNum}-suggestPopover`);
  expect(suggestionBox).not.toBeNull();
  expect(suggestionBox).toContainHTML(mockPassedCourseList[1].name);
  expect(suggestionBox).not.toContainHTML(mockPassedCourseList[0].name);
}, 100000);

// A repeatable course is removed if dragged onto current semester
test("DropAccordion - Suggestions remove repeatable course in course in current semester", async () => {
  // A course is marked as complete and is repeatable (it should be listed)
  const mockPassedCourseList: CourseType[] = [
    {
      credits: 3,
      name: "mock course-repeatable",
      number: "999",
      semesters: "",
      subject: "REP",
      preReq: "",
      category: "cat-1",
      idCourse: 2,
      idCategory: 1,
      dragSource: "CourseList",
      repeatableForCred: true
    },
    {
      credits: 3,
      name: "mock course-2",
      number: "998",
      semesters: "",
      subject: "COR",
      preReq: "",
      category: "cat-1",
      idCourse: 1,
      idCategory: 1,
      dragSource: "CourseList",
      repeatableForCred: false
    }
  ];
  const mockSemesters: SemesterType[] = [
    {
      accepts: ["course"],
      semesterNumber: 0,
      courses: [
        mockPassedCourseList[0] // add the repeatable course to sem 1
      ],
      SemesterCredits: 0,
      Warning: null,
      year: 1,
      season: season.Fall
    },
    {
      accepts: ["course"],
      semesterNumber: 1,
      courses: [],
      SemesterCredits: 0,
      Warning: null,
      year: 1,
      season: season.Winter
    },
    {
      accepts: ["course"],
      semesterNumber: 2,
      courses: [],
      SemesterCredits: 0,
      Warning: null,
      year: 1,
      season: season.Spring
    },
    {
      accepts: ["course"],
      semesterNumber: 3,
      courses: [],
      SemesterCredits: 0,
      Warning: null,
      year: 1,
      season: season.Summer
    }
  ];
  buildLocalStorage({
    completed_courses: [],
    concentration: {
      idConcentration: -1,
      name: "Test Concentration",
      fourYearPlan: JSON.stringify({
        Major: "Test Major",
        Concentration: "Test Concentration",
        ClassPlan: {
          Semester1: {
            Courses: [
              "REP-999", "COR-998"
            ],
            Requirements: []
          },
          Semester2: {
            Courses: [],
            Requirements: []
          }
        }
      })
    },
    major: {
      id: -1,
      name: "Test Major"
    },
    load_four_year_plan: false
  });
  const user = setupUser();
  const index = render(
    <PassedCourseListContext.Provider value={mockPassedCourseList}>
      <DropTargetAccordian
        semesters={mockSemesters}
        year={0}
        handleDrop={() => {}}
        warningPrerequisiteCourses={[]}
        warningFallvsSpringCourses={[]}
        warningDuplicateCourses={[]}
      />
    </PassedCourseListContext.Provider>
  );
  expect(index.baseElement).toMatchSnapshot();
  // only semester 1 has a course
  const semNum = 0;
  // Open the suggestions
  const suggestContentBtn = screen.getByTestId(`semester${semNum}-suggestBtn`);
  await user.click(suggestContentBtn);
  const suggestionBox = screen.queryByTestId(`semester${semNum}-suggestPopover`);
  expect(suggestionBox).not.toBeNull();

  // Expect the repeatable course to be gone (it's in the current semester already)
  expect(suggestionBox).not.toContainHTML(mockPassedCourseList[0].name);
  // Expect the non-repeatable course to be suggested
  expect(suggestionBox).toContainHTML(mockPassedCourseList[1].name);
}, 100000);
