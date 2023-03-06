import { MajorType } from "../../entities/four_year_plan";
import { fetchApiJson } from "../util";

test("Check major list", async () => {
  const majors: MajorType[] = await fetchApiJson("/api/major");
  expect(majors.map((m) => m.id)).toBeUnique();
  majors.forEach((m) => {
    expect(typeof m.id).toBe("number");
    expect(typeof m.name).toBe("string");
  });
});
