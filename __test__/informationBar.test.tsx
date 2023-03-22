import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import { setupUser, render } from "./util";
import InformationDrawer from "../components/InformationBar";
import { RequirementComponentType } from "../entities/four_year_plan";
import { setUserMajor } from "../services/user";
const requirementsDisplayList: RequirementComponentType[] = [{
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

test("Test Requirements in the Information Bar on the Schedule Page", async () => {
  const user = setupUser();
  const bar = render(<InformationDrawer requirementsDisplay={requirementsDisplayList} />);
  expect(bar.baseElement).toMatchSnapshot();
  expect(screen.getByText(/Major/i)).toBeInTheDocument();
  expect(screen.getByText(/CS CSSSD/i)).toBeInTheDocument();
  expect(screen.getByText(/Gen Eds/i)).toBeInTheDocument();
  expect(screen.getByText(/GLP/i)).toBeInTheDocument();
  try {
    screen.getByText(/CS - Cyber Security and Secure Software Development/i);
    expect(false);
  } catch (error) {
    expect(true);
  }
  const openButton = screen.getByTestId("openDrawer");
  await user.click(openButton);
  expect(screen.getByText(/CS - Cyber Security and Secure Software Development/i)).toBeInTheDocument();
  const closeButton = screen.getByTestId("closeDrawer");
  await user.click(closeButton);
  expect(screen.getByText(/CS CSSSD/i)).toBeInTheDocument();
});

test("Test Switching Tabs on Information Bar", async () => {
  const user = setupUser();
  const major = { id: 1, name: "CS" };
  const concentration = { idConcentration: 1, name: "CSSSD", fourYearPlan: "{'Major': 'Computer Science', 'ClassPlan': {'Semester1': {'Courses': ['CS-144', 'CNIT-133', 'ENGL-101', 'MATH-156'], 'Requirements': []}, 'Semester2': {'Courses': ['CS-145', 'ENGL-102', 'MATH-157', 'CNIT-134'], 'Requirements': []}, 'Semester3': {'Courses': ['COMST-100', 'CS-244', 'CS-248', 'MATH-270'], 'Requirements': ['SBSCI']}, 'Semester4': {'Courses': ['CNIT-301', 'CS-324', 'CS-290', 'ICT-103', 'MATH-275'], 'Requirements': []}, 'Semester5': {'Courses': ['CNIT-382', 'CS-254', 'CS-480', 'ICT-215'], 'Requirements': ['ARHU']}, 'Semester6': {'Courses': ['CS-358', 'CNIT-383', 'CNIT-361', 'MATH-158'], 'Requirements': ['ARNS w/ Lab']}, 'Semester7': {'Courses': ['CS-458', 'CS-441', 'CNIT-484'], 'Requirements': ['ARHU']}, 'Semester8': {'Courses': ['CS-458', 'CS-442'], 'Requirements': ['SBSCI', 'ARNS', 'CS-3XX']}}, 'Concentration': 'Cyber Security and Secure Software Development'}" };
  setUserMajor({
    major,
    concentration,
    load_four_year_plan: true,
    completed_courses: ["ANTH-220"]
  });
  const bar = render(<InformationDrawer requirementsDisplay={requirementsDisplayList} />);
  expect(bar.baseElement).toMatchSnapshot();
  const openButton = screen.getByTestId("openDrawer");
  await user.click(openButton);
  const completedTab = screen.getByText("Completed Courses");
  await user.click(completedTab);
  expect(screen.getByText(/ANTH-220/i)).toBeInTheDocument();

  const closeButton = screen.getByTestId("closeDrawer");
  await user.click(closeButton);
  await user.click(openButton);
  expect(screen.getByText(/ANTH-220/i)).toBeInTheDocument();

  const planTab = screen.getByText("Four Year Plan");
  await user.click(planTab);
  expect(screen.getByText(/four year plan for/i)).toBeInTheDocument();
});
test("Test Add Only One Tab on Information Bar", async () => {
  const user = setupUser();
  const major = { id: 1, name: "CS" };
  const concentration = { idConcentration: 1, name: "CSSSD", fourYearPlan: "{'Major': 'Computer Science', 'ClassPlan': {'Semester1': {'Courses': ['CS-144', 'CNIT-133', 'ENGL-101', 'MATH-156'], 'Requirements': []}, 'Semester2': {'Courses': ['CS-145', 'ENGL-102', 'MATH-157', 'CNIT-134'], 'Requirements': []}, 'Semester3': {'Courses': ['COMST-100', 'CS-244', 'CS-248', 'MATH-270'], 'Requirements': ['SBSCI']}, 'Semester4': {'Courses': ['CNIT-301', 'CS-324', 'CS-290', 'ICT-103', 'MATH-275'], 'Requirements': []}, 'Semester5': {'Courses': ['CNIT-382', 'CS-254', 'CS-480', 'ICT-215'], 'Requirements': ['ARHU']}, 'Semester6': {'Courses': ['CS-358', 'CNIT-383', 'CNIT-361', 'MATH-158'], 'Requirements': ['ARNS w/ Lab']}, 'Semester7': {'Courses': ['CS-458', 'CS-441', 'CNIT-484'], 'Requirements': ['ARHU']}, 'Semester8': {'Courses': ['CS-458', 'CS-442'], 'Requirements': ['SBSCI', 'ARNS', 'CS-3XX']}}, 'Concentration': 'Cyber Security and Secure Software Development'}" };
  setUserMajor({
    major,
    concentration,
    load_four_year_plan: true,
    completed_courses: []
  });
  const bar = render(<InformationDrawer requirementsDisplay={requirementsDisplayList} />);
  expect(bar.baseElement).toMatchSnapshot();
  const openButton = screen.getByTestId("openDrawer");
  await user.click(openButton);

  const planTab = screen.getByText("Four Year Plan");
  await user.click(planTab);
  expect(screen.getByText(/four year plan for/i)).toBeInTheDocument();
});
