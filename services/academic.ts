import { useQuery, UseQueryResult } from "react-query";
import {
  Concentration,
  Course,
  Major,
  Requirements
} from "../entities/four_year_plan";
import { fetchApi } from "./util";

// TODO: use fetchApi to make request to actual API

export function majorList(): UseQueryResult<Major[]> {
  return useQuery("Major List", async () => await fetchApi(`/api/major`));
}

export function concentrationList(
  majorId: number | undefined
): UseQueryResult<Concentration[] | null> {
  return useQuery(
    ["concentrations", majorId],
    async () => await fetchApi(`/api/concentration?majid=${majorId}`)
  );
}

export function courseSubjects(): UseQueryResult<Array<string>> {
  return useQuery("courseSubjects", async () => await fetchApi(`/api/subjects`));
}

export function courseNumbers(
  subject: string | undefined
): UseQueryResult<Concentration[] | null> {
  return useQuery(
    ["courseNumbers", subject],
    async () => await fetchApi(`/api/subjects/numbers?sub=${subject}`)
  );
}

export async function course(course: number): Promise<Course> {
  throw new Error("TODO");
}

export async function requirements(
  concentration: number
): Promise<Requirements | null> {
  throw new Error("TODO");
}
