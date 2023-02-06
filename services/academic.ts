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

export function concentration(
  concentration: number
): UseQueryResult<Concentration | null> {
  return useQuery(
    ["concectrations", concentration],
    async () => await fetchApi(`/api/concentrations?conid=${concentration}`)
  );
  // switch (concentration) {
  //   case 0:
  //     return { id: 0, name: "Sec", four_year_plan: "null" };
  //   default:
  //     return null;
  // }
}

export async function course(course: number): Promise<Course> {
  throw new Error("TODO");
}

export async function requirements(
  concentration: number
): Promise<Requirements | null> {
  throw new Error("TODO");
}
