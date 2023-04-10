import "@testing-library/jest-dom";
import { screen, waitFor, within } from "@testing-library/react";
import { buildLocalStorage, parentEl, render } from "./util";
import App from "../pages/scheduler";
import { academicDb } from "../services/sql";

const savedSchedule = [
  {
    year: 0,
    seasons: [
      { season: "Fall", classes: [] },
      { season: "Winter", classes: [] },
      { season: "Spring", classes: [] },
      { season: "Summer", classes: [] }
    ]
  },
  {
    year: 1,
    seasons: [
      { season: "Fall", classes: ["CS-144", "COMST-100", "ENGL-101"] },
      { season: "Winter", classes: [] },
      {
        season: "Spring",
        classes: ["CS-145", "ENGL-102", "MATH-157", "MATH-156"]
      },
      { season: "Summer", classes: [] }
    ]
  },
  {
    year: 2,
    seasons: [
      { season: "Fall", classes: ["CS-244", "CS-248", "MATH-275"] },
      { season: "Winter", classes: [] },
      { season: "Spring", classes: ["CS-254", "CS-324", "MATH-270", "CS-290"] },
      { season: "Summer", classes: [] }
    ]
  },
  {
    year: 3,
    seasons: [
      { season: "Fall", classes: ["CS-343", "ICT-215", "CS-364"] },
      { season: "Winter", classes: [] },
      { season: "Spring", classes: ["CS-358", "CS-404"] },
      { season: "Summer", classes: [] }
    ]
  },
  {
    year: 4,
    seasons: [
      { season: "Fall", classes: ["CS-458", "CS-441"] },
      { season: "Winter", classes: [] },
      { season: "Spring", classes: ["CS-458", "CS-442"] },
      { season: "Summer", classes: [] }
    ]
  }
];

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
  const doc = render(<App />);
  // Verify MATH-157 has a pre-requisite error
  await waitFor(() => {
    const el = parentEl(
      screen.getByText(/Calculus and Analytic Geometry II/i),
      "Course"
    );
    expect(el.classList).toContain("CourseWarningRed");
  });
  expect(doc.baseElement).toMatchSnapshot();
  // Verify Requirements were calculated
  expect(
    within(parentEl(screen.getByText(/CS MA/i), "Requirement")).getByText(/44/i)
  ).toBeInTheDocument();
  // Verify low/high warnings were calculated
  expect(screen.getAllByText(/Fall \(10\) Low/i)).toBeInTheDocument();
});
