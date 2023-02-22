import { ConcentrationType } from "../../entities/four_year_plan";
import { fetchApiJson } from "../util";

test("Check Concentration list", async () => {
  const majors: ConcentrationType[] = await fetchApiJson(
    "/api/concentration?majid=2"
  );
  expect(majors.map((m) => m.idConcentration)).toBeUnique();
  majors.forEach((m) => {
    expect(typeof m.idConcentration).toBe("number");
    expect(typeof m.name).toBe("string");
  });
});

test("Check Concentration list", async () => {
  const majors: ConcentrationType[] = await fetchApiJson(
    "/api/concentration?majid=4"
  );
  expect(majors.map((m) => m.idConcentration)).toBeUnique();
  majors.forEach((m) => {
    expect(typeof m.idConcentration).toBe("number");
    expect(typeof m.name).toBe("string");
  });
});
