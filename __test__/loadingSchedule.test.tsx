import "@testing-library/jest-dom";
import { screen, waitFor, within } from "@testing-library/react";
import {
  buildLocalStorage,
  mockUserInfo,
  parentEl,
  render,
  setupUser
} from "./util";
import App from "../pages/scheduler";
import { academicDb } from "../services/sql";

import { savedSchedule } from "./sampleData";
import { UserLogin } from "../services/user";

test("Load saved schedule", async () => {
  const con = await academicDb();
  // const user = setupUser();
  const major = await con.get("SELECT * from major WHERE idMajor=2");
  buildLocalStorage({
    schedule_name: "Test Name",
    load_four_year_plan: true,
    completed_courses: [],
    concentration: await con.get(
      "SELECT * from concentration WHERE idConcentration=13"
    ),
    major: {
      id: major.idMajor,
      name: major.name
    }
  });
  window.localStorage.setItem(
    "current-schedule",
    JSON.stringify(savedSchedule)
  );
  const user = setupUser();
  const userLogin = mockUserInfo("aslkdfj");
  const doc = render(
    <UserLogin.Provider value={userLogin}>
      <App />
    </UserLogin.Provider>
  );
  // Verify MATH-157 has a pre-requisite error
  await waitFor(
    () => {
      const el = parentEl(
        screen.getByText(/Calculus and Analytic Geometry II/i),
        "Course"
      );
      expect(el.classList).toContain("CourseWarningRed");
    },
    { timeout: 10000 }
  );
  expect(doc.baseElement).toMatchSnapshot();
  // Verify Requirements were calculated
  expect(
    within(parentEl(screen.getByText(/CS MA/i), "Requirement")).getByText(/44/i)
  ).toBeInTheDocument();
  // Verify low/high warnings were calculated
  expect(screen.getAllByText(/Fall \(10\) Low/i)[0]).toBeInTheDocument();

  await user.click(screen.getByTestId("saveButton"));
  expect(screen.getByLabelText(/Schedule Name/i)).toHaveValue("Test Name");
}, 50000);
