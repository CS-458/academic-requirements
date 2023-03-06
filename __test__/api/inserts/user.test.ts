import { userDb } from "../../../services/sql";
import {
  createMockToken,
  fetchApiJson,
  mockToken,
  setupMockUserDB
} from "../../util";

beforeAll(async () => {
  await setupMockUserDB();
  createMockToken();
});

test("Insert test user id", async () => {
  const response = await fetchApiJson("/api/inserts/user", {
    method: "POST",
    headers: {
      "X-Google-Token": mockToken("InsTestUser")
    }
  });

  expect(response).toStrictEqual({ message: "Successfully registered user" });
  const db = await userDb();
  expect(
    await db.get("SELECT idUser FROM user WHERE idUser='InsTestUser'")
  ).toEqual({ idUser: "InsTestUser" });
});

test("Invalid test user id", async () => {
  const response = await fetchApiJson("/api/inserts/user", {
    method: "POST",
    headers: {
      "X-Google-Token": "InsTestUser2"
    }
  });

  expect(response).toStrictEqual({ error: "Invalid user token" });
  const db = await userDb();
  expect(
    await db.get("SELECT idUser FROM user WHERE idUser='InsTestUser2'")
  ).not.toBeDefined();
});
