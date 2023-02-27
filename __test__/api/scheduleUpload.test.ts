import { fetchApiJson, setupUser } from "../util";
import sql from "../../services/sql";
import { PromisedDatabase as Database } from "promised-sqlite3";

test("Check import of Schedule Data", async () => {
  const scheduleData = "This is a Test Schedule";
  const userid = 123;

  // const db = jest.fn(sql).mockReturnValueOnce(new Promise<Database>((resolve, reject) => {
  //   resolve({
  //     all: new Promise((resolve) => resolve(jest.fn()))
  //   });
  // }));
  

  const response = await fetchApiJson(`/api/schedule?userID=${userid}&scheduleData=${scheduleData}`);

  expect(response?.message).toBeTruthy();
}, 100000000);
