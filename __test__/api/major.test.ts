import { testApiHandler } from "next-test-api-route-handler";
import handler from "../../pages/api/major";
import { fetchReplace } from "../util";

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
  await fetchReplace("/api/requirements/gen?conid=undefined");
  await fetchReplace("/api/subjects/numbers?sub=");
  await fetchReplace("/api/concentration?majid=undefined");
  await fetchReplace("/api/courses/major?majid=undefined");
  await fetchReplace("/api/courses/concentration?conid=undefined");
  await fetchReplace("/api/requirements?conid=undefined");
  await fetchReplace("/api/requirements/gen?conid=undefined");
}, 100000000);
