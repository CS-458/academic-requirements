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
    "CREATE TABLE `schedule` ( `userID` TEXT, `name` TEXT, `timestamp` INTEGER, `scheduleData` TEXT NOT NULL, PRIMARY KEY(`userID`, `name`))"
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

test("Check Schedule Get", async () => {
  setupTokenMock();
  const schedule = {
    Major: "major",
    Concentration: "concentration",
    "Completed Courses": ["C-1", "C-2"],
    ClassPlan: {
      Semester1: ["C-X", "C-Y"],
      Semester2: ["C-X", "C-Y"],
      Semester3: ["C-X", "C-Y"],
      Semester4: ["C-X", "C-Y"],
      Semester5: ["C-X", "C-Y"],
      Semester6: ["C-X", "C-Y"],
      Semester7: ["C-X", "C-Y"],
      Semester8: ["C-X", "C-Y"]
    }
  };

  const insertResponse = await fetchApiJson(`/api/inserts/schedule?name=${"name"}`, {
    method: "POST",
    body: JSON.stringify(schedule),
    headers: {
      "X-Google-Token": mockToken("12345")
    }
  });

  expect(insertResponse).toStrictEqual({ message: "Successfully uploaded schedule" });
  console.log(
    await db.all("SELECT * FROM schedule WHERE userID='12345'")
  );

  const getResponse = await fetchApiJson("/api/user/schedules", {
    method: "GET",
    headers: {
      "X-Google-Token": mockToken("12345")
    }
  });
  expect(getResponse?.length).toBeGreaterThan(0);
  expect(getResponse[0]?.scheduleData).toStrictEqual(schedule);
}, 100000000);
