import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/react";
import { jest } from "@jest/globals";

import ScheduleUploadModal from "../components/ScheduleUploadModal";
import ActionBar from "../components/ActionBar";
import { setupUser, render, createMockToken, setupMockUserDB, mockToken } from "./util";
import { userMajor, UserLogin, User } from "../services/user";

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

beforeAll(async () => {
  await setupMockUserDB();
  createMockToken();
});

test("Action Bar Visible", async () => {
  const alertMocked = jest.fn();
  const index = render(<ActionBar
    scheduleData={infoMocked}
    setAlertData={alertMocked}
  />);
  expect(index.baseElement).toBeInTheDocument();
});

test("Saving A Schedule with out being signed in", async () => {
  const alertMocked = jest.fn();
  const user = setupUser();
  const index = render(<ScheduleUploadModal
    scheduleData={infoMocked}
    setAlertData={alertMocked}
  />);

  const saveButton = screen.getByTestId("saveButton");

  expect(index.baseElement).toBeInTheDocument();
  await user.click(saveButton);
  expect(index.getByText("Save Schedule")).toBeVisible();
  await user.click(index.getByText("Save"));
  expect(alertMocked).toBeCalledWith("User Not Logged in! Please Log in to save your Schedule.", "warning");
});

test("Saving A Schedule Successfully", async () => {
  const alertMocked = jest.fn();
  await setupMockUserDB();
  const userLogin: User = {
    info: {
      email: "",
      name: "",
      picture: "",
      sub: "12345"
    },
    cred: mockToken("12345")
  };
  const user = setupUser();
  const index = render(
    <UserLogin.Provider value={userLogin}>
      <ScheduleUploadModal
        scheduleData={infoMocked}
        setAlertData={alertMocked}
      />
    </UserLogin.Provider>);

  const saveButton = screen.getByTestId("saveButton");

  expect(index.baseElement).toBeInTheDocument();
  await user.click(saveButton);
  expect(index.getByText("Save Schedule")).toBeInTheDocument();
  await user.click(index.getByText("Save"));

  await waitFor(async () => {
    expect(alertMocked).toBeCalled();
  });
  expect(alertMocked).toBeCalledWith("Successfully Saved Schedule!", "success");
});

test("No Schedule Name error", async () => {
  const alertMocked = jest.fn();
  await setupMockUserDB();
  const userLogin: User = {
    info: {
      email: "",
      name: "",
      picture: "",
      sub: "12345"
    },
    cred: mockToken("12345")
  };
  const user = setupUser();
  const index = render(
    <UserLogin.Provider value={userLogin}>
      <ScheduleUploadModal
        scheduleData={infoMocked}
        setAlertData={alertMocked}
      />
    </UserLogin.Provider>);

  const saveButton = screen.getByTestId("saveButton");

  expect(index.baseElement).toBeInTheDocument();
  await user.click(saveButton);
  expect(index.getByText("Save Schedule")).toBeInTheDocument();

  const textEntry = screen.getByLabelText("Schedule Name");
  await user.clear(textEntry);
  await user.click(index.getByText("Save"));
  await waitFor(async () => {
    expect(alertMocked).toBeCalledWith("Schedule MUST have a name!", "warning");
  });
});
