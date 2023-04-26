import "../util.tsx";
import { getSchedules, uploadSchedule } from "../../services/user";
import { fetchApiRoute, mockUserInfo } from "../util";

beforeAll(() => {
  window.fetch = fetchApiRoute;
});

test("getSchedules returns empty for error", async () => {
  const user = mockUserInfo("");
  user.cred = "";
  expect(await getSchedules(user)).toStrictEqual([]);
});

test("uploadSchedule throws with an invalid token", async () => {
  await expect(uploadSchedule(undefined, "S1", {})).rejects.toThrowError(
    "User is not logged in"
  );
});
