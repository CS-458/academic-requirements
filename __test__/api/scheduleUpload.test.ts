import {
  createMockToken as setupTokenMock,
  fetchApiJson,
  mockToken
} from "../util";
import { setUserDb } from "../../services/sql";
import { PromisedDatabase } from "promised-sqlite3";

const db = new PromisedDatabase();
beforeAll(async () => {
  await db.open(":memory:");
  await db.run(
    "CREATE TABLE `user` ( `idUser` TEXT PRIMARY KEY, `role` TEXT NOT NULL)"
  );
  await db.run(
    "CREATE TABLE `schedule` ( `userID` TEXT, `name` TEXT, `timestamp` INTEGER NOT NULL, `scheduleData` TEXT NOT NULL, PRIMARY KEY(`userID`, `name`))"
  );
  setUserDb(db);
});

test("Check import of Schedule Data", async () => {
  setupTokenMock();

  const response = await fetchApiJson(`/api/inserts/schedule?name=${"name"}`, {
    method: "POST",
    body: JSON.stringify({}),
    headers: {
      "X-Google-Token": mockToken("1234")
    }
  });

  expect(response).toStrictEqual({ message: "Successfully uploaded schedule" });
  // console.log(response);
  console.log(
    await db.get("SELECT * FROM schedule WHERE userID='1234' AND name='name'")
  );
}, 100000000);
