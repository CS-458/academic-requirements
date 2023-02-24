import { CourseType } from "../../../entities/four_year_plan";
import { fetchApiJson, courseSemestersCheck } from "../../util";

test("Check Major Course list (CS)", async () => {
  // Computer Science
  const courses: CourseType[] = await fetchApiJson(
    "/api/courses/major?majid=2"
  );

  // check for data
  expect(courses.length).toBeGreaterThan(1);

  // check data types
  // semesters and preReq may be null
  courses.forEach((c) => {
    expect(typeof c.subject).toBe("string");
    expect(typeof c.number).toBe("string");
    expect(typeof c.credits).toBe("number");

    if (c.semesters !== null) {
      expect(typeof c.semesters).toBe("string");
      courseSemestersCheck(c.semesters);
    }

    expect(typeof c.name).toBe("string");

    if (c.preReq !== null) {
      expect(typeof c.preReq).toBe("string");
    }

    expect(typeof c.idCourse).toBe("number");
    expect(typeof c.category).toBe("string");
    expect(typeof c.idCategory).toBe("number");
  });
});

test("Check Major Course list (no majid provided)", async () => {
  const response = await fetchApiJson(
    "/api/courses/major"
  );
  expect(response.error).toBeTruthy();
});
