import { useQuery, UseQueryResult } from "react-query";
import {
  Concentration,
  Course,
  Major,
  Requirements
} from "../entities/four_year_plan";
import { fetchApi } from "./util";

// TODO: use fetchApi to make request to actual API

// Get and cache the list of majors
export function majorList(): UseQueryResult<Major[]> {
  return useQuery("Major List", async () => await fetchApi(`/api/major`));
}

// Get and cache the list of concentrations
export function concentrationList(
  majorId: number | undefined
): UseQueryResult<Concentration[] | null> {
  return useQuery(
    ["concentrations", majorId],
    async () => await fetchApi(`/api/concentration?majid=${majorId}`)
  );
}

// Get and cache the list of subject acronyms
export function courseSubjects(): UseQueryResult<Array<string>> {
  return useQuery("courseSubjects", async () => await fetchApi(`/api/subjects`));
}

// Get and cache the list of numbers for a subject acronym
export function courseNumbers(
  subject: number | undefined
): UseQueryResult<Array<string> | null> {
  return useQuery(
    ["courseNumbers", subject],
    async () => await fetchApi(`/api/subjects/numbers?sub=${subject}`)
  );
}

// TODO Maj/Conc/Gen courses

// TODO: Maj/Conc/Gen Requirements

export async function course(course: number): Promise<Course> {
  throw new Error("TODO");
}

export async function requirements(
  concentration: number
): Promise<Requirements | null> {
  throw new Error("TODO");
}
