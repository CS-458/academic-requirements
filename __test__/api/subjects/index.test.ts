import { fetchApiJson } from "../../util";

test("Check Subjects", async () => {
  const subjects: string[] = await fetchApiJson(
    "/api/subjects"
  );
  expect(subjects.length).toBeGreaterThan(1);

  // copy and sort alphabetically
  const sortedSubjects = subjects.concat([]);
  sortedSubjects.sort((a: string, b: string) => {
    return a.localeCompare(b);
  });

  // ensure the retrieved values are sorted as expected
  subjects.forEach((value: string, index: number) => {
    expect(value).toBe(sortedSubjects[index]);
  });
});
