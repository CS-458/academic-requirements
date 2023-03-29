import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import { render } from "../util";
import App from "../../pages/scheduler";
import { setUserMajor } from "../../services/user";

// eslint-disable-next-line @typescript-eslint/quotes, quotes
const concentration = { idConcentration: 1, name: "CSSSD", fourYearPlan: '{"Major": "Computer Science", "ClassPlan": {"Semester1": {"Courses": ["CS-144", "CNIT-133", "ENGL-101", "MATH-156"], "Requirements": []}, "Semester2": {"Courses": ["CS-145", "ENGL-102", "MATH-157", "CNIT-134"], "Requirements": []}, "Semester3": {"Courses": ["COMST-100", "CS-244", "CS-248", "MATH-270"], "Requirements": ["SBSCI"]}, "Semester4": {"Courses": ["CNIT-301", "CS-324", "CS-290", "ICT-103", "MATH-275"], "Requirements": []}, "Semester5": {"Courses": ["CNIT-382", "CS-254", "CS-480", "ICT-215"], "Requirements": ["ARHU"]}, "Semester6": {"Courses": ["CS-358", "CNIT-383", "CNIT-361", "MATH-158"], "Requirements": ["ARNS w/ Lab"]}, "Semester7": {"Courses": ["CS-458", "CS-441", "CNIT-484"], "Requirements": ["ARHU"]}, "Semester8": {"Courses": ["CS-458", "CS-442"], "Requirements": ["SBSCI", "ARNS", "CS-3XX"]}}, "Concentration": "Cyber Security and Secure Software Development"}' };
const major = { id: 1, name: "CS" };

test("Test render of scheduler", async () => {
  setUserMajor({
    major,
    concentration,
    load_four_year_plan: true,
    completed_courses: ["ANTH-220"]
  });
  const page = render(<App />);
  expect(page.baseElement).toMatchSnapshot();
  expect(screen.getByTestId("courseListDropTarget")).toBeInTheDocument();
});
