import { fetchApiJson } from "../util";

// test("Check major list", async () => {
//   await testApiHandler({
//     handler,
//     url: "/api/concentration?majid=2",
//     params: { majid: "2" },
//     test: async ({ fetch }) => {
//       const res = await fetch({ method: "GET" });
//       console.error(await res.json());
//     }
//   });
// });

test("Check major list 2", async () => {
  expect(
    fetchApiJson("/api/requirements/gen?conid=undefined")
  ).resolves.toStrictEqual([]);
  expect(fetchApiJson("/api/subjects/numbers?sub=")).resolves.toStrictEqual([]);
  expect(
    fetchApiJson("/api/concentration?majid=undefined")
  ).resolves.toStrictEqual([]);
  expect(
    fetchApiJson("/api/courses/major?majid=undefined")
  ).resolves.toStrictEqual([]);
  expect(
    fetchApiJson("/api/courses/concentration?conid=undefined")
  ).resolves.toStrictEqual([]);
  expect(
    fetchApiJson("/api/requirements?conid=undefined")
  ).resolves.toStrictEqual([]);
  expect(
    fetchApiJson("/api/requirements/gen?conid=undefined")
  ).resolves.toStrictEqual([]);
}, 100000000);
