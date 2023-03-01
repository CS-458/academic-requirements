import { ConcentrationType } from "../../entities/four_year_plan";
import { fetchApiJson } from "../util";

test("Check Concentration list", async () => {
  const concentrations: ConcentrationType[] = await fetchApiJson(
    "/api/concentration?majid=2"
  );
  expect(concentrations.map((m) => m.idConcentration)).toBeUnique();
  concentrations.forEach((m) => {
    expect(typeof m.idConcentration).toBe("number");
    expect(typeof m.name).toBe("string");
  });
});

test("Check Concentration list", async () => {
  const concentrations: ConcentrationType[] = await fetchApiJson(
    "/api/concentration?majid=4"
  );
  expect(concentrations.map((m) => m.idConcentration)).toBeUnique();
  concentrations.forEach((m) => {
    expect(typeof m.idConcentration).toBe("number");
    expect(typeof m.name).toBe("string");
  });
});

test("Check Concentration list (no major provided)", async () => {
  const response = await fetchApiJson(
    "/api/concentration"
  );
  expect(response.error).toBeTruthy();
});
