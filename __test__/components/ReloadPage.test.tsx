import "@testing-library/jest-dom";
import { fireEvent, getByTestId, screen, within } from "@testing-library/react";
import { setupUser, render, fetchApiJson, parentEl } from "../util";
import { jest } from "@jest/globals";
import FourYearPlanPage from "../../components/FourYearPlanPage";
import InformationDrawer from "../../components/InformationBar";
import { CourseType, RequirementComponentType, season, SemesterType, UserSavedSchedule } from "../../entities/four_year_plan";
import { setUserMajor, userMajor } from "../../services/user";
import ReloadPage from "../../components/ReloadPage";

// eslint-disable-next-line @typescript-eslint/quotes, quotes
const concentration = { idConcentration: 1, name: "CSSSD", fourYearPlan: '{"Major": "Computer Science", "ClassPlan": {"Semester1": {"Courses": ["CS-144", "CNIT-133", "ENGL-101", "MATH-156"], "Requirements": []}, "Semester2": {"Courses": ["CS-145", "ENGL-102", "MATH-157", "CNIT-134"], "Requirements": []}, "Semester3": {"Courses": ["COMST-100", "CS-244", "CS-248", "MATH-270"], "Requirements": ["SBSCI"]}, "Semester4": {"Courses": ["CNIT-301", "CS-324", "CS-290", "ICT-103", "MATH-275"], "Requirements": []}, "Semester5": {"Courses": ["CNIT-382", "CS-254", "CS-480", "ICT-215"], "Requirements": ["ARHU"]}, "Semester6": {"Courses": ["CS-358", "CNIT-383", "CNIT-361", "MATH-158"], "Requirements": ["ARNS w/ Lab"]}, "Semester7": {"Courses": ["CS-458", "CS-441", "CNIT-484"], "Requirements": ["ARHU"]}, "Semester8": {"Courses": ["CS-458", "CS-442"], "Requirements": ["SBSCI", "ARNS", "CS-3XX"]}}, "Concentration": "Cyber Security and Secure Software Development"}' };

const mockedRequirementsDisplayList: RequirementComponentType[] = [{
  courseCount: null,
  courseCountTaken: 0,
  courseReqs: "CNIT-133,CNIT-134,CNIT-301,CNIT-361,CNIT-382,CNIT-383,CNIT-484,CS-458,CS-480",
  coursesTaken: "",
  creditCount: 32,
  creditCountTaken: 0,
  idCategory: 19,
  name: "CS - Cyber Security and Secure Software Development",
  parentCategory: null,
  percentage: 0,
  shortName: "CS CSSSD",
  inheritedCredits: 0
}, {
  courseCount: null,
  courseCountTaken: 0,
  courseReqs: null,
  coursesTaken: "",
  creditCount: 6,
  creditCountTaken: 0,
  idCategory: 22,
  name: "Global Perspective (GLP)",
  parentCategory: null,
  percentage: 0,
  shortName: "GLP",
  inheritedCredits: 0
}];

const mockedSem: SemesterType[] = [
  {
    accepts: [""], // this is just a course constant
    semesterNumber: 1, // number of the semester
    courses: [], // list of courses in semester
    SemesterCredits: 5, // number of credits in the semester
    Warning: null, // credit warning (high or low)
    year: 1, // year number 1,2,3,4,etc.
    season: season.Fall
  },
  {
    accepts: [""], // this is just a course constant
    semesterNumber: 2, // number of the semester
    courses: [], // list of courses in semester
    SemesterCredits: 5, // number of credits in the semester
    Warning: null, // credit warning (high or low)
    year: 1, // year number 1,2,3,4,etc.
    season: season.Spring
  }];

//  MOCKED JSON Data for the Courses
const infoMocked = {
  Major: userMajor()?.major.name,
  Concentration: userMajor()?.concentration.name,
  "Completed Courses": userMajor()?.completed_courses,
  ClassPlan: {
    Semester1: [],
    Semester2: [],
    Semester3: [],
    Semester4: [],
    Semester5: [],
    Semester6: [],
    Semester7: [],
    Semester8: []
  }
};

const mockedSchduleData = [{
  userID: "mocked",
  name: "mocked",
  timestamp: 1,
  scheduleData: {
    Major: userMajor()?.major.name,
    Concentration: userMajor()?.concentration.name,
    "Completed Courses": userMajor()?.completed_courses,
    schedule: [{ year: 1, seasons: [{ season: "Fall", classes: [] }] }]
  }
}];

const mockedSetSemesters = jest.fn();
const mockedHandleReturn = jest.fn();

test("Reload Button is Visible", async () => {
  const reloadButton = render(<ReloadPage
  scheduleData={mockedSchduleData}
  sems={mockedSem}
  requirementsData={mockedRequirementsDisplayList}
  setSemesters={mockedSetSemesters}
  handleReturn={mockedHandleReturn}
  />);
  expect(reloadButton.baseElement).toBeInTheDocument();
});

// Functional test
test("Reload Button is Functional", async () => {
  const user = setupUser();
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
  const bar = render(<FourYearPlanPage PassedCourseList={coursesMajor.concat(courses)} requirements={reqs} requirementsGen={reqsGen} />);
  expect(bar.baseElement).toMatchSnapshot();

  const firstYear = parentEl(screen.getByText(/Year 1/i), "MuiAccordion");
  expect(firstYear).toBeInTheDocument();
  const fallSemester = parentEl(
    within(firstYear).getByText(/Fall/i),
    "Semester"
  );
  expect(fallSemester).toBeInTheDocument();

  const categoryTab = screen.getByTestId("category-tab");
  await user.click(categoryTab);
  await user.selectAutocomplete("Course Category", "CS - Computer Science Core");

  const rb = screen.getByTestId("rloadButton");

  // creating the course and drags it to the semester
  const course = screen.getAllByTestId("course");
  fireEvent.dragStart(course[0]);
  fireEvent.dragEnter(fallSemester);
  fireEvent.dragOver(fallSemester);
  fireEvent.drop(fallSemester);

  // checking the course gets added
  const openButton = screen.getByTestId("openDrawer");
  await user.click(openButton);
  const reqPercentages = screen.getAllByTestId("reqPercent");
  expect(reqPercentages[0]).toContainHTML("3.3");
  expect(reqPercentages[2]).toContainHTML("9.1");
  const closeButton = screen.getByTestId("closeDrawer");
  await user.click(closeButton);

  // refreshes the page and resets the credits
  await user.click(rb);
  await user.click(openButton);
  expect(reqPercentages[0]).toContainHTML("0");
  expect(reqPercentages[2]).toContainHTML("0");
  await user.click(closeButton);

  // add 2 courses then retry
  fireEvent.dragStart(course[0]);
  fireEvent.dragEnter(fallSemester);
  fireEvent.dragOver(fallSemester);
  fireEvent.drop(fallSemester);
  fireEvent.dragStart(course[1]);
  fireEvent.dragEnter(fallSemester);
  fireEvent.dragOver(fallSemester);
  fireEvent.drop(fallSemester);
  await user.click(openButton);
  // reqPercentages = screen.getAllByTestId("reqPercent");
  expect(reqPercentages[0]).toContainHTML("6.7");
  expect(reqPercentages[2]).toContainHTML("18.2");
  await user.click(closeButton);

  await user.click(rb);
  await user.click(openButton);
  expect(reqPercentages[0]).toContainHTML("0");
  expect(reqPercentages[2]).toContainHTML("0");
  await user.click(closeButton);
}, 1000000);
