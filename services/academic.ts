import { useQuery, UseQueryResult } from "react-query";
import {
  ConcentrationType,
  CourseType,
  MajorType,
  RequirementComponentType
} from "../entities/four_year_plan";
import { fetchApi } from "./util";

// TODO: use fetchApi to make request to actual API

// Get and cache the list of majors
export function majorList(): UseQueryResult<MajorType[]> {
  return useQuery("Major List", async () => await fetchApi("/api/major"));
}

export type Concentration = ConcentrationType[] | undefined;

// Get and cache the list of concentrations
export function concentrationList(
  majorId: number | undefined
): UseQueryResult<Concentration> {
  return useQuery(
    ["concentrations", majorId],
    async () => await fetchApi(`/api/concentration?majid=${majorId}`)
  );
}

// Get and cache the list of concentrations
export function concentrationListAll(): UseQueryResult<Concentration> {
  return useQuery(
    ["concentrations_all"],
    async () => await fetchApi("/api/concentration_all")
  );
}

// Get and cache the list of subject acronyms
export function courseSubjects(): UseQueryResult<string[]> {
  return useQuery(
    "courseSubjects",
    async () => await fetchApi("/api/subjects")
  );
}

// Get and cache the list of numbers for a subject acronym
export function courseNumbers(
  subject: string | undefined
): UseQueryResult<string[] | undefined> {
  return useQuery(
    ["courseNumbers", subject],
    async () => await fetchApi(`/api/subjects/numbers?sub=${subject}`)
  );
}

// Get and cache the list of major courses
export function majorCourseList(
  majorId: number | undefined
): UseQueryResult<CourseType[] | undefined> {
  return useQuery(
    ["majorCourseList", majorId],
    async () => await fetchApi(`/api/courses/major?majid=${majorId}`)
  );
}

// Get and cache the list of concentration courses
export function concentrationCourseList(
  conId: number | undefined
): UseQueryResult<CourseType[] | undefined> {
  return useQuery(
    ["concentrationCourseList", conId],
    async () => await fetchApi(`/api/courses/concentration?conid=${conId}`)
  );
}

// Get and cache the list of gened courses
export function genedCourseList(): UseQueryResult<CourseType[]> {
  return useQuery(
    "genedCourseList",
    async () => await fetchApi("/api/courses/geneds")
  );
}

export function masterCourseList(
  majId: number | undefined,
  conId: number | undefined
): CourseType[] {
  const c1 = majorCourseList(majId).data;
  const c2 = concentrationCourseList(conId).data;
  const c3 = genedCourseList().data;

  if (c1 != null && c2 != null && c3 != null) {
    return c1.concat(c2).concat(c3);
  }
  return [];
}

// Get and cache the list of category requirements
export function courseCategoryRequirements(
  conId: number | undefined
): UseQueryResult<RequirementComponentType[] | null> {
  return useQuery(
    ["courseCategoryRequirements", conId],
    async () => await fetchApi(`/api/requirements?conid=${conId}`)
  );
}

type Req = RequirementComponentType[];

// Get and cache the list of gen-ed requirements
export function genedCategoryRequirements(): UseQueryResult<Req> {
  return useQuery(
    "genedRequirements",
    async () => await fetchApi("/api/requirements/gen")
  );
}

// From a list of courses, get all the unique categories
export function extractCategories(courses: CourseType[]): Array<string> {
  // Initialize new set (no duplicates).
  const i = new Set<string>();
  // Add course categories from courses array
  courses.map((course, index) => {
    i.add(course.category);
  });
  // Convert to an array of Strings
  return Array.from(i);
}
