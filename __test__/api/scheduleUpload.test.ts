import { fetchApiJson } from "../util";
import sql from "../../services/sql";

test("Check import of Schedule Data", async () => {
  let db = await sql();
  await db.run("BEGIN IMMEDIATE");

  const response = await fetchApiJson(`/api/inserts/schedule?name=${"name"}`, {
    method: "POST",
    body: JSON.stringify({}),
    headers: {
      "X-Google-Token": "TEST_TOKEN"
    }
  });

  expect(response).toStrictEqual({ message: "Successfully uploaded schedule" });
  // console.log(response);
  console.log(
    await db.get("SELECT * FROM schedule WHERE userID='1234' AND name='name'")
  );
  await db.run("ROLLBACK");
}, 100000000);
