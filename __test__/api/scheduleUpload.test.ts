import {
  createMockToken as setupTokenMock,
  fetchApiJson,
  mockToken
} from "../util";
import sql from "../../services/sql";

test("Check import of Schedule Data", async () => {
  setupTokenMock();
  const db = await sql();
  await db.run("BEGIN IMMEDIATE");

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
  await db.run("ROLLBACK");
}, 100000000);
