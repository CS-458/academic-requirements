import { fetchApi } from "../services/util";
import { fetchApiRoute } from "./util";

beforeAll(() => {
  window.fetch = fetchApiRoute;
});

test("fetchApi works", async () => {
  await expect(fetchApi("/api/major")).resolves.toStrictEqual([
    {
      id: 2,
      name: "Computer Science"
    },
    {
      id: 4,
      name: "Applied Math and Computer Science"
    },
    {
      id: 5,
      name: "Psychology"
    }
  ]);
});

test("fetchApi throws", async () => {
  await expect(fetchApi("/api/invalid")).rejects.toThrowError(
    "Response code 404 for request to /api/invalid"
  );
});
