import "@testing-library/jest-dom";
import { screen, within } from "@testing-library/react";
import { render, fetchApiJson, parentEl } from ".././util";
import FourYearPlanPage from "../../components/FourYearPlanPage";
import { CourseType, RequirementComponentType } from "../../entities/four_year_plan";
import { setUserMajor } from "../../services/user";
import { setupUser } from "../util";

// eslint-disable-next-line @typescript-eslint/quotes, quotes
const concentration = { idConcentration: 1, name: "CSSSD", fourYearPlan: '{"Major": "Computer Science", "ClassPlan": {"Semester1": {"Courses": ["CS-144"], "Requirements": []}, "Semester2": {"Courses": ["CS-145", "ENGL-102", "MATH-157", "CNIT-134"], "Requirements": []}, "Semester3": {"Courses": ["COMST-100", "CS-244", "CS-248", "MATH-270"], "Requirements": ["SBSCI"]}, "Semester4": {"Courses": ["CNIT-301", "CS-324", "CS-290", "ICT-103", "MATH-275"], "Requirements": []}, "Semester5": {"Courses": ["CNIT-382", "CS-254", "CS-480", "ICT-215"], "Requirements": ["ARHU"]}, "Semester6": {"Courses": ["CS-358", "CNIT-383", "CNIT-361", "MATH-158"], "Requirements": ["ARNS w/ Lab"]}, "Semester7": {"Courses": ["CS-458", "CS-441", "CNIT-484"], "Requirements": ["ARHU"]}, "Semester8": {"Courses": ["CS-458", "CS-442"], "Requirements": ["SBSCI", "ARNS", "CS-3XX"]}}, "Concentration": "Cyber Security and Secure Software Development"}' };
const major = { id: 1, name: "CS" };

test("Test undo and redo button", async () => {
  setUserMajor({
    major,
    concentration,
    load_four_year_plan: true,
    completed_courses: ["ANTH-220"]
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
  const page = render(<FourYearPlanPage PassedCourseList={coursesMajor.concat(courses)} requirements={reqs} requirementsGen={reqsGen} />);
  expect(page.baseElement).toMatchSnapshot();
  const user = setupUser();
  // check 144 in first semester
  const firstYear = parentEl(screen.getByText(/Year 1/i), "MuiAccordion");
  expect(firstYear).toBeInTheDocument();
  const fallSemester = parentEl(
    within(firstYear).getByText(/Fall/i),
    "Semester"
  );
  expect(fallSemester).toBeInTheDocument();
  expect(within(fallSemester).getAllByTestId("course")[0]).toContainHTML("144");
  const winterSemester = parentEl(
    within(firstYear).getByText(/Winter/i),
    "Semester"
  );
  await user.drag(within(fallSemester).getAllByTestId("course")[0], winterSemester);
  expect(within(winterSemester).getAllByTestId("course")[0]).toContainHTML("144");
  const undo = screen.getByTestId("undoButton");
  await user.click(undo);
  expect(within(fallSemester).getAllByTestId("course")[0]).toContainHTML("144");
  const redo = screen.getByTestId("redoButton");
  await user.click(redo);
  expect(within(winterSemester).getAllByTestId("course")[0]).toContainHTML("144");
});
