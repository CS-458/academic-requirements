import "@testing-library/jest-dom";
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
import { userDb } from "../../services/sql";

test("Test Render of the account page", async () => {
  // Build mock schedule data
  await setupMockUserDB();
  const users = await userDb();
  await users.exec("INSERT INTO user VALUES ('a', 'user')");
  await users.exec(
    "INSERT INTO schedule(userID, name, scheduleData) VALUES ('a', 'Schedule 1', '{}')"
  );
  await users.exec(
    "INSERT INTO schedule(userID, name, scheduleData) VALUES ('a', 'Schedule 2', '{}')"
  );
  await users.exec(
    "INSERT INTO schedule(userID, name, scheduleData) VALUES ('a', 'Schedule 3', '{}')"
  );

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

  // expect(await screen.findByText(/Schedule 2/i)).toBeInTheDocument();
  // expect(await screen.findByText(/Schedule 3/i)).toBeInTheDocument();
});
