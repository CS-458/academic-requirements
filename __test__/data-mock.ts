import { UseQueryResult } from "react-query";
import { MajorType } from "../entities/four_year_plan";

function mockData<TData>(data: TData): UseQueryResult<TData> {
  return {
    data,
    error: null,
    isError: false,
    isIdle: false,
    isLoading: false,
    isLoadingError: false,
    isRefetchError: false,
    isSuccess: true,
    status: "success",
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: Date.now(),
    failureCount: 0,
    errorUpdateCount: 0,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isPlaceholderData: false,
    isPreviousData: false,
    isRefetching: false,
    isStale: false,
    refetch: async (_) => mockData(data),
    remove: () => {}
  };
}

const moduleInner = {
  majorList: (): UseQueryResult<MajorType[]> => mockData([])
  // function majorList(): UseQueryResult<Major[]> {
  //   return useQuery("Major List", async () => await fetchApi(`/api/major`));
  // }
  //
  // export function concentration(
  //   concentration: number
  // ): UseQueryResult<Concentration | null> {
  //   return useQuery(
  //     ["concectrations", concentration],
  //     async () => await fetchApi(`/api/concentrations?conid=${concentration}`)
  //   );
  //   // switch (concentration) {
  //   //   case 0:
  //   //     return { id: 0, name: "Sec", four_year_plan: "null" };
  //   //   default:
  //   //     return null;
  //   // }
  // }
  //
  // export async function course(course: number): Promise<Course> {
  //   throw new Error("TODO");
  // }
  //
  // export async function requirements(
  //   concentration: number
  // ): Promise<Requirements | null> {
  //   throw new Error("TODO");
  // }
};

export default moduleInner;

jest.mock("../services/academic", () => moduleInner);
