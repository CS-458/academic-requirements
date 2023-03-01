import { fetchApiJson } from "../../util";

test("Check Subject Numbers (CS)", async () => {
  const subjectNumbers: string[] = await fetchApiJson(
    "/api/subjects/numbers?sub=CS"
  );
  expect(subjectNumbers.length).toBeGreaterThan(1);

  // copy and sort alphabetically
  const sortedSubjects = subjectNumbers.concat([]);
  sortedSubjects.sort((a: string, b: string) => {
    return a.localeCompare(b);
  });

  // ensure the retrieved values are sorted as expected
  subjectNumbers.forEach((value: string, index: number) => {
    expect(value).toBe(sortedSubjects[index]);
  });
});

test("Check Subject Numbers (no subject provided)", async () => {
  const response = await fetchApiJson(
    "/api/subjects/numbers"
  );
  expect(response.error).toBeTruthy();
});
