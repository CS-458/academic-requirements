import { fetchApiJson } from "../util";

test("Check major list", async () => {
  expect(await fetchApiJson("/api/major")).toStrictEqual([
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
}, 100000000);
