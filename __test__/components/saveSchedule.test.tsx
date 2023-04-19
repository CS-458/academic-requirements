import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/react";
import { jest } from "@jest/globals";

import ScheduleUploadModal, { getDateTime, hide, unHide } from "../../components/ScheduleUploadModal";
import ActionBar from "../../components/ActionBar";
import {
  setupUser,
  render,
  createMockToken,
  setupMockUserDB,
  mockToken,
  mockUserInfo
} from "../util";
import { userMajor, UserLogin, User } from "../../services/user";
import { exportComponentAsPNG } from "react-component-export-image";
import { ECDH } from "crypto";

jest.useFakeTimers({
  doNotFake: [
    "hrtime",
    "nextTick",
    "performance",
    "queueMicrotask",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "requestIdleCallback",
    "cancelIdleCallback",
    "setImmediate",
    "clearImmediate",
    "setInterval",
    "clearInterval",
    "setTimeout",
    "clearTimeout"
  ],
  advanceTimers: false,
  now: new Date("2020-01-01")
});

//  MOCKED JSON Data for the Courses
const infoMocked: UserSavedSchedule["scheduleData"] = {
  Major: userMajor()?.major.id ?? -1,
  Concentration: userMajor()?.concentration.idConcentration ?? -1,
  "Completed Courses": userMajor()?.completed_courses ?? [],
  schedule: [],
  usedFourYearPlan: userMajor()?.load_four_year_plan ?? false
};

beforeAll(async () => {
  await setupMockUserDB();
  createMockToken();
});

test("Action Bar Visible and other buttons are visible", async () => {
  const alertMocked = jest.fn();
  const index = render(
    <ActionBar
      scheduleData={infoMocked}
      setAlertData={alertMocked}
      sems={[]}
      resetRedo={() => { }}
      resetMoved={() => { }}
      handleReturn={() => { }}
      setSemesters={() => { }}
      setSavedErrors={() => { }}
      resetRequirements={() => { }}
    >
      <div />
    </ActionBar>
  );
  expect(index.baseElement).toBeInTheDocument();
});

test("Saving A Schedule with out being signed in", async () => {
  const alertMocked = jest.fn();
  render(
    <ScheduleUploadModal scheduleData={infoMocked} setAlertData={alertMocked} />
  );

  const saveButton = screen.getByTestId("saveButton");
  expect(saveButton).toBeDisabled();
});

test("Saving as a PNG and PDF", async () => {
  const alertMocked = jest.fn();
  const user = setupUser();
  window.print = jest.fn();
  const index = render(<div><ScheduleUploadModal
    scheduleData={infoMocked}
    setAlertData={alertMocked}
  />
  <div className="printed"><div className="MuiCollapse-root"></div></div>
  </div>);

  const savePDF = screen.getByTestId("SavePdf");
  const savePNG = screen.getByTestId("SavePng");

  expect(index.baseElement).toBeInTheDocument();
  expect(savePDF).toBeInTheDocument();
  expect(savePNG).toBeInTheDocument();

  dispatchEvent(new Event("beforeprint"));
  expect(savePDF).not.toBeVisible();
  dispatchEvent(new Event("afterprint"));
  expect(savePDF).toBeVisible();

  await user.click(savePDF);
  expect(window.print).toHaveBeenCalled();
});

test("Saving as a PNG and PDF", async () => {
  const alertMocked = jest.fn();
  const user = setupUser();
  window.print = jest.fn();
  const index = render(<ScheduleUploadModal
    scheduleData={infoMocked}
    setAlertData={alertMocked}
  />);

  const savePDF = screen.getByTestId("SavePdf");
  const savePNG = screen.getByTestId("SavePng");

  expect(index.baseElement).toBeInTheDocument();
  expect(savePDF).toBeInTheDocument();
  expect(savePNG).toBeInTheDocument();

  await user.click(savePNG);

  dispatchEvent(new Event("beforeprint"));
  expect(savePDF).not.toBeVisible();
  dispatchEvent(new Event("afterprint"));
  expect(savePDF).toBeVisible();

  await user.click(savePDF);
  expect(window.print).toHaveBeenCalled();
});

test("Saving A Schedule Successfully & No Name auto saves as Date/Time", async () => {
  const alertMocked = jest.fn();
  await setupMockUserDB();
  const userLogin: User = mockUserInfo("12345");
  const user = setupUser();
  const index = render(
    <UserLogin.Provider value={userLogin}>
      <ScheduleUploadModal
        scheduleData={infoMocked}
        setAlertData={alertMocked}
      />
    </UserLogin.Provider>
  );

  const saveButton = screen.getByTestId("saveButton");

  expect(index.baseElement).toBeInTheDocument();
  await user.click(saveButton);
  expect(index.getByText("Save Schedule")).toBeInTheDocument();
  const nestedSavedButton = screen.getByTestId("nestedSavedButton");
  await user.click(nestedSavedButton);

  await waitFor(async () => {
    expect(alertMocked).toBeCalled();
  });
  expect(alertMocked).toBeCalledWith(
    "Successfully Saved Schedule as " + getDateTime() + "!",
    "success"
  );
});

test("Saving A Schedule Successfully with a custom name", async () => {
  const alertMocked = jest.fn();
  await setupMockUserDB();
  const userLogin: User = mockUserInfo("12345");
  const user = setupUser();
  const index = render(
    <UserLogin.Provider value={userLogin}>
      <ScheduleUploadModal
        scheduleData={infoMocked}
        setAlertData={alertMocked}
      />
    </UserLogin.Provider>
  );

  const saveButton = screen.getByTestId("saveButton");
  const name = "Custom";

  expect(index.baseElement).toBeInTheDocument();
  await user.click(saveButton);
  expect(index.getByText("Save Schedule")).toBeInTheDocument();
  const textEntry = screen.getByLabelText("Schedule Name");
  await user.clear(textEntry);
  await user.type(textEntry, name);
  await user.click(index.getByText("Save"));

  await waitFor(async () => {
    expect(alertMocked).toBeCalled();
  });
  expect(alertMocked).toBeCalledWith(
    "Successfully Saved Schedule as " + name + "!",
    "success"
  );
});

test("Saving A Schedule Successfully with an empty name", async () => {
  const alertMocked = jest.fn();
  await setupMockUserDB();
  const userLogin: User = mockUserInfo("12345");
  const user = setupUser();
  const index = render(
    <UserLogin.Provider value={userLogin}>
      <ScheduleUploadModal
        scheduleData={infoMocked}
        setAlertData={alertMocked}
      />
    </UserLogin.Provider>
  );

  const saveButton = screen.getByTestId("saveButton");
  const name = " ";

  expect(index.baseElement).toBeInTheDocument();
  await user.click(saveButton);
  expect(index.getByText("Save Schedule")).toBeInTheDocument();
  const textEntry = screen.getByLabelText("Schedule Name");
  await user.clear(textEntry);
  await user.type(textEntry, name);
  await user.click(index.getByText("Save"));

  await waitFor(async () => {
    expect(alertMocked).toBeCalled();
  });
  expect(alertMocked).toBeCalledWith(
    "Successfully Saved Schedule as " + getDateTime() + "!",
    "success"
  );
});
