import { userDb } from "../../../services/sql";
import {
  createMockToken,
  fetchApiJson,
  fetchApiRoute,
  mockToken,
  setupMockUserDB,
  userId
} from "../../util";

beforeAll(async () => {
  await setupMockUserDB();
  createMockToken();
});

test("Insert test user id", async () => {
  const response = await fetchApiJson("/api/inserts/user", {
    method: "POST",
    headers: {
      "X-Google-Token": mockToken()
    }
  });

  expect(response).toStrictEqual({ message: "Successfully registered user" });
  const db = await userDb();
  expect(
    await db.get(`SELECT idUser FROM user WHERE idUser='${userId()}'`)
  ).toEqual({ idUser: userId() });
});

test("Invalid test user id", async () => {
  {
    const response = await fetchApiJson("/api/inserts/user", {
      method: "POST"
    });
    expect(response).toStrictEqual({ error: "Invalid user not logged in" });
  }

  {
    const response = await fetchApiJson("/api/inserts/user", {
      method: "POST",
      headers: {
        "X-Google-Token": "InsTestUser2"
      }
    });
    expect(response).toStrictEqual({ error: "Invalid user token" });
  }

  const db = await userDb();
  expect(
    await db.get("SELECT idUser FROM user WHERE idUser='InsTestUser2'")
  ).not.toBeDefined();
});

test("Invalid method", async () => {
  const response = await fetchApiRoute("/api/inserts/user", {
    method: "GET",
    headers: {
      "X-Google-Token": mockToken()
    }
  });

  expect(response.status).toBe(405);
  const db = await userDb();
  expect(
    await db.get(`SELECT idUser FROM user WHERE idUser='${userId()}'`)
  ).not.toBeDefined();
});
