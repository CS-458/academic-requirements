import "@testing-library/jest-dom";
import { fireEvent, screen, within } from "@testing-library/react";
import { setupUser, render, fetchApiJson, parentEl } from "./util";
import FourYearPlanPage from "../components/FourYearPlanPage";
import { RequirementComponentType, CourseType } from "../entities/four_year_plan";

test("Test whether requirements visually update on the screen", async () => {
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

  // This section tests major req update
  const categoryTab = screen.getByTestId("category-tab");
  await user.click(categoryTab);
  await user.selectAutocomplete("Course Category", "CS - Computer Science Core");

  const firstYear = parentEl(screen.getByText(/Year 1/i), "MuiAccordion");
  expect(firstYear).toBeInTheDocument();
  const fallSemester = parentEl(
    within(firstYear).getByText(/Fall/i),
    "Semester"
  );
  expect(fallSemester).toBeInTheDocument();

  const course = screen.getAllByTestId("course");
  fireEvent.dragStart(course[0]);
  fireEvent.dragEnter(fallSemester);
  fireEvent.dragOver(fallSemester);
  fireEvent.drop(fallSemester);

  const openButton = screen.getByTestId("openDrawer");
  await user.click(openButton);
  let reqPercentages = screen.getAllByTestId("reqPercent");
  expect(reqPercentages[0]).toContainHTML("3.3");
  expect(reqPercentages[2]).toContainHTML("9.1");
  const closeButton = screen.getByTestId("closeDrawer");
  await user.click(closeButton);

  fireEvent.dragStart(course[1]);
  fireEvent.dragEnter(fallSemester);
  fireEvent.dragOver(fallSemester);
  fireEvent.drop(fallSemester);
  await user.click(openButton);
  reqPercentages = screen.getAllByTestId("reqPercent");
  expect(reqPercentages[0]).toContainHTML("6.7");
  expect(reqPercentages[2]).toContainHTML("18.2");
  await user.click(closeButton);

  const courseList = screen.getByTestId("courseListDropTarget");
  const CS244 = screen.getAllByTestId("course")[0];
  fireEvent.dragStart(CS244);
  fireEvent.dragEnter(courseList);
  fireEvent.dragOver(courseList);
  fireEvent.drop(courseList);
  await user.click(openButton);
  reqPercentages = screen.getAllByTestId("reqPercent");
  expect(reqPercentages[0]).toContainHTML("3.3");
  expect(reqPercentages[2]).toContainHTML("9.1");
  await user.click(closeButton);

  const CS145 = screen.getAllByTestId("course")[0];
  fireEvent.dragStart(CS145);
  fireEvent.dragEnter(courseList);
  fireEvent.dragOver(courseList);
  fireEvent.drop(courseList);
  await user.click(openButton);
  reqPercentages = screen.getAllByTestId("reqPercent");
  expect(reqPercentages[0]).toContainHTML("0");
  expect(reqPercentages[2]).toContainHTML("0");
  await user.click(closeButton);

  // This section tests that GenEd Reqs update
  await user.click(categoryTab);
  await user.selectAutocomplete("Course Category", "Global Perspective (GLP)");

  const genCourse = screen.getAllByTestId("course");
  fireEvent.dragStart(genCourse[0]);
  fireEvent.dragEnter(fallSemester);
  fireEvent.dragOver(fallSemester);
  fireEvent.drop(fallSemester);

  await user.click(openButton);
  reqPercentages = screen.getAllByTestId("reqPercent");
  expect(reqPercentages[0]).toContainHTML("2.5");
  expect(reqPercentages[4]).toContainHTML("50");
  expect(reqPercentages[5]).toContainHTML("50");
  expect(reqPercentages[9]).toContainHTML("50");
  await user.click(closeButton);

  fireEvent.dragStart(genCourse[1]);
  fireEvent.dragEnter(fallSemester);
  fireEvent.dragOver(fallSemester);
  fireEvent.drop(fallSemester);
  await user.click(openButton);
  reqPercentages = screen.getAllByTestId("reqPercent");
  expect(reqPercentages[0]).toContainHTML("5");
  expect(reqPercentages[4]).toContainHTML("100");
  await user.click(closeButton);

  const ANTH220 = screen.getAllByTestId("course")[0];
  fireEvent.dragStart(ANTH220);
  fireEvent.dragEnter(courseList);
  fireEvent.dragOver(courseList);
  fireEvent.drop(courseList);
  await user.click(openButton);
  reqPercentages = screen.getAllByTestId("reqPercent");
  expect(reqPercentages[0]).toContainHTML("2.5");
  expect(reqPercentages[4]).toContainHTML("50");
  expect(reqPercentages[5]).toContainHTML("0");
  expect(reqPercentages[9]).toContainHTML("0");
  await user.click(closeButton);
}, 1000000);
