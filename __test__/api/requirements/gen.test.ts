import { RequirementType } from "../../../entities/four_year_plan";
import { fetchApiJson } from "../../util";

test("Check GenEd Requirements", async () => {
  const reqs: RequirementType[] = await fetchApiJson(
    "/api/requirements/gen"
  );

  // check for data
  expect(reqs.length).toBeGreaterThan(1);

  // check data types
  // semesters and preReq may be null
  reqs.forEach((r) => {
    expect(typeof r.idCategory).toBe("number");
    expect(typeof r.name).toBe("string");

    if (r.parentCategory !== null) {
      expect(typeof r.parentCategory).toBe("number");
    }

    if (r.creditCount !== null) {
      expect(typeof r.creditCount).toBe("number");
    }
    if (r.courseCount !== null) {
      expect(typeof r.courseCount).toBe("number");
    }
    if (r.courseReqs !== null) {
      expect(typeof r.courseReqs).toBe("string");
    }
  });
});
