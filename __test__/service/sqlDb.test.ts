import { academicDb, userDb } from "../../services/sql";

test("Load databases", async () => {
  const academic = await academicDb();
  expect(await academic.exists("major", "1=1")).toBe(true);
  const user = await userDb();
  const counts = await user.get("select count(idUser), count(role) from user");
  expect(counts["count(idUser)"]).toBeGreaterThanOrEqual(0);
  expect(counts["count(role)"]).toBeGreaterThanOrEqual(0);
});
