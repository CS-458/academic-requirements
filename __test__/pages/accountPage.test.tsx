import "@testing-library/jest-dom";
import { jest } from "@jest/globals";
import { screen, waitFor, within } from "@testing-library/react";
import {
  fetchApiRoute,
  mockUserInfo,
  parentEl,
  render,
  setupMockUserDB,
  setupUser
} from "../util";
import App from "../../pages/account";
import { UserLogin } from "../../services/user";
import { academicDb, userDb } from "../../services/sql";
import { savedSchedule } from "../sampleData";
import Router from "next/router";

const dbSchedule = {
  Major: 2,
  Concentration: 13,
  "Completed Courses": [],
  schedule: savedSchedule,
  usedFourYearPlan: false
};

beforeAll(async () => {
  // @ts-expect-error This is intended to override the Router.push function
  Router.push = jest.fn().mockResolvedValue(true);
  // Build mock schedule data
  await setupMockUserDB();
  const users = await userDb();
  await users.exec("INSERT INTO user VALUES ('a', 'user')");
  await users.exec(
    `INSERT INTO schedule(userID, name, scheduleData) VALUES ('a', 'Schedule 1', '${JSON.stringify(
      dbSchedule
    )}')`
  );
  await users.exec(
    `INSERT INTO schedule(userID, name, scheduleData) VALUES ('a', 'Schedule 2', '${JSON.stringify(
      dbSchedule
    )}')`
  );
  await users.exec(
    `INSERT INTO schedule(userID, name, scheduleData) VALUES ('a', 'Schedule 3', '${JSON.stringify(
      {
        Major: -1,
        Concentration: -1,
        "Completed Courses": [],
        schedule: savedSchedule,
        usedFourYearPlan: false
      }
    )}')`
  );
  await users.exec(
    `INSERT INTO schedule(userID, name, scheduleData) VALUES ('a', 'Schedule 4', '${JSON.stringify(
      {
        Major: -1,
        Concentration: 13,
        "Completed Courses": [],
        schedule: savedSchedule,
        usedFourYearPlan: false
      }
    )}')`
  );
});

test("Test Render of the account page", async () => {
  const user = setupUser();
  const bar = render(
    <UserLogin.Provider value={mockUserInfo("a")}>
      <App />
    </UserLogin.Provider>
  );
  expect(bar.baseElement).toMatchSnapshot();
  expect(screen.getByText(/Saved Schedules/i)).toBeInTheDocument();
  const schedule1 = parentEl(
    await screen.findByText(/Schedule 1/i),
    "Schedule"
  );
  expect(schedule1).toBeInTheDocument();
  await user.click(within(schedule1).getByTestId("delete"));
  await waitFor(() => expect(screen.queryByText(/Schedule 1/i)).toBeNull());
});

test("Test Edit button", async () => {
  const user = setupUser();
  const bar = render(
    <UserLogin.Provider value={mockUserInfo("a")}>
      <App />
    </UserLogin.Provider>
  );
  expect(bar.baseElement).toMatchSnapshot();
  expect(screen.getByText(/Saved Schedules/i)).toBeInTheDocument();
  const schedule = parentEl(await screen.findByText(/Schedule 2/i), "Schedule");
  expect(schedule).toBeInTheDocument();
  await user.click(within(schedule).getByTestId("edit"));
  await waitFor(() => expect(Router.push).toHaveBeenCalled());
  expect(Router.push).toHaveBeenCalledWith("/scheduler");

  const academic = await academicDb();
  expect(JSON.parse(localStorage.getItem("user_major") ?? "{}")).toMatchObject({
    completed_courses: dbSchedule["Completed Courses"],
    concentration: await academic.get(
      "select idConcentration,name,fourYearPlan  from concentration where idConcentration = ?",
      [dbSchedule.Concentration]
    ),
    major: {
      id: dbSchedule.Major,
      name: (
        await academic.get(
          "select name from major where idMajor = ?",
          dbSchedule.Major
        )
      ).name
    },
    load_four_year_plan: dbSchedule.usedFourYearPlan,
    schedule_name: "Schedule 2"
  });

  expect(
    JSON.parse(localStorage.getItem("current-schedule") ?? "{}")
  ).toMatchObject(savedSchedule);
});

test("Test Edit button w/ Invalid Schedule", async () => {
  const user = setupUser();
  render(
    <UserLogin.Provider value={mockUserInfo("a")}>
      <App />
    </UserLogin.Provider>
  );

  {
    expect(screen.getByText(/Saved Schedules/i)).toBeInTheDocument();
    const schedule1 = parentEl(
      await screen.findByText(/Schedule 3/i),
      "Schedule"
    );
    expect(schedule1).toBeInTheDocument();
    await user.click(within(schedule1).getByTestId("edit"));
    await waitFor(() => expect(screen.queryByText(/Schedule 3/i)).toBeNull());
  }
  {
    expect(screen.getByText(/Saved Schedules/i)).toBeInTheDocument();
    const schedule1 = parentEl(
      await screen.findByText(/Schedule 4/i),
      "Schedule"
    );
    expect(schedule1).toBeInTheDocument();
    await user.click(within(schedule1).getByTestId("edit"));
    await waitFor(() => expect(screen.queryByText(/Schedule 4/i)).toBeNull());
  }
});

test("Test Redirect", async () => {
  const bar = render(
    <UserLogin.Provider value={undefined}>
      <App />
    </UserLogin.Provider>
  );
  expect(bar.baseElement).toMatchSnapshot();
  await waitFor(() => expect(Router.push).toHaveBeenCalled());
  expect(Router.push).toHaveBeenCalledWith("/");
});
