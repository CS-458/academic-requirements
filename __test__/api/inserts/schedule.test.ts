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

test("Insert schedule", async () => {
  const db = await userDb();

  const upload = await fetchApiJson("/api/inserts/schedule?name=S1", {
    method: "POST",
    headers: {
      "X-Google-Token": mockToken()
    },
    body: JSON.stringify({})
  });
  expect(upload).toStrictEqual({ message: "Successfully uploaded schedule" });
  expect(
    await db.get(
      `SELECT name FROM schedule WHERE userID='${userId()}' and name='S1'`
    )
  ).toEqual({ name: "S1" });
});

test("Invalid test user id", async () => {
  {
    const response = await fetchApiJson("/api/inserts/schedule?name=S1", {
      method: "POST",
      body: JSON.stringify({})
    });
    expect(response).toStrictEqual({ error: "Invalid user not logged in" });
  }

  {
    const response = await fetchApiJson("/api/inserts/schedule?name=S1", {
      method: "POST",
      headers: {
        "X-Google-Token": "InsTestUser2"
      },
      body: JSON.stringify({})
    });
    expect(response).toStrictEqual({ error: "Invalid user token" });
  }

  const db = await userDb();
  expect(
    await db.get(`SELECT idUser FROM user WHERE idUser='${userId()}'`)
  ).not.toBeDefined();
});

test("Invalid method", async () => {
  const response = await fetchApiRoute("/api/inserts/schedule?name=S1", {
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

test("Invalid name", async () => {
  const upload = await fetchApiJson("/api/inserts/schedule?name=S3", {
    method: "POST",
    headers: {
      "X-Google-Token": mockToken()
    },
    body: JSON.stringify({})
  });
  expect(upload).toStrictEqual({ message: "Successfully uploaded schedule" });

  const response = await fetchApiJson("/api/inserts/schedule", {
    method: "POST",
    headers: {
      "X-Google-Token": mockToken()
    }
  });

  expect(response).toStrictEqual({ error: "Invalid parameters: {}" });
});
