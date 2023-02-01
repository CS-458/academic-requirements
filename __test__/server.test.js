const app = require("./server.js");
const mysql = require("mysql");
const supertest = require("supertest");
const dbconfig = {
  host: "mscsdb.uwstout.edu",
  user: "academicSelect",
  password: "mergeSort45!",
  database: "academicrequirements"
};
let connection;

beforeEach(async () => {
  connection = mysql.createConnection(dbconfig);
});

afterEach(async () => {
  connection.end();
});

// These comments pertain to every test written
// Defining the test
it("test /major endpoint", async () => {
  // supertest(app).get is going to the route that is inside the get and retreiving data
  await supertest(app)
    .get("/major")
    // expect 200 means that we successfully got our data
    .expect(200)
    // if we got our data, then we take it and check a few things
    .then((response) => {
      // check if the response is an array
      expect(Array.isArray(response.body)).toBeTruthy();
      // check if the response is not an empty array
      expect(response.body.length).toBeGreaterThan(0);
    });
});

it("test /concentration endpoint", async () => {
  await supertest(app)
    .get("/concentration?majid=2")
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });
});

it("test /courses/major endpoint", async () => {
  await supertest(app)
    .get("/courses/major?majid=2")
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });
});

it("test /courses/concentration endpoint", async () => {
  await supertest(app)
    .get("/courses/concentration?conid=3")
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });
});

it("test /courses/geneds endpoint", async () => {
  await supertest(app)
    .get("/courses/geneds")
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });
});

it("test /requirements endpoint", async () => {
  await supertest(app)
    .get("/requirements?conid=10")
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });
});

it("test /subjects endpoint", async () => {
  await supertest(app)
    .get("/subjects")
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });
});

it("test /subjects/numbers endpoint", async () => {
  await supertest(app)
    .get("/subjects/numbers?sub=CS")
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });
});

it("test /majorID endpoint", async () => {
  await supertest(app)
    .get("/majorID?mname=Computer Science")
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });
});

it("test /concentrationID endpoint", async () => {
  await supertest(app)
    .get("/concentrationID?cname=Mobile Applications")
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });
});
