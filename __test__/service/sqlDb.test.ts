import { academicDb, userDb } from "../../services/sql";

test("Load databases", async () => {
  const academic = await academicDb();
  expect(await academic.exists("major", "1=1")).toBe(true);
  const user = await userDb();
  expect(await user.exists("user", "1=1")).toBe(true);
});
