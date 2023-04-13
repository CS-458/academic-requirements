import React from "react";
import {
  ConcentrationType,
  MajorType,
  UserSavedSchedule
} from "../entities/four_year_plan";
import { fetchApi } from "./util";
export interface UserMajor {
  /// Major ID number
  major: MajorType;
  /// Concentration ID number
  concentration: ConcentrationType;
  /// Whether to load a four year plan
  load_four_year_plan: boolean;
  /// A list of completed courses taken
  completed_courses: string[];
  /// Default schedule name, if provided
  schedule_name?: string;
}

export function userMajor(): UserMajor | undefined {
  const data = window.localStorage.getItem("user_major");
  if (data !== null) {
    return JSON.parse(data);
  } else {
    return undefined;
  }
}

export function setUserMajor(maj: UserMajor | undefined): void {
  if (maj !== undefined) {
    window.localStorage.setItem("user_major", JSON.stringify(maj));
  } else {
    window.localStorage.removeItem("user_major");
  }
}

export interface UserInfo {
  /// Profile URL
  picture: string;
  /// User ID
  sub: string;
  name: string;
  email: string;
  exp: number;
  nbf: number;
}

export interface User {
  info: UserInfo;
  cred: string;
}

export const UserLogin = React.createContext<undefined | User>(undefined);
export function userToken(): string | undefined {
  return React.useContext(UserLogin)?.cred;
}

// Calls the API to upload the schedule to the Database
export async function uploadSchedule(
  token: string | undefined,
  name: string,
  schedule: any
): Promise<void> {
  if (token === undefined) {
    throw new Error("User is not logged in");
  }
  const response: { error: string } | { message: string } = await fetchApi(
    `/api/inserts/schedule?name=${name}`,
    {
      method: "POST",
      body: JSON.stringify(schedule),
      headers: {
        "X-Google-Token": token
      }
    }
  );
  if ("error" in response) {
    throw new Error(`Request failed: ${response.error}`);
  }
}

/*
  Function used to store user into the user table
  May not be needed since we are checking if the user exists
  when uploading the schedule
*/
// export async function saveLoggedInUser(): Promise<void> {
//   const token = userToken();
//   if (token === undefined) {
//     throw new Error("User Token Not made");
//   }
//   await fetchApi("/api/inserts/user", {
//     method: "POST",
//     headers: {
//       "X-Google-Token": token
//     }
//   });
// }

/// Returns a list of scheuldes that include the name
// export async function getScheduleByName(
//   token: User,
//   name: string
// ): Promise<UserSavedSchedule[]> {
//   return (await getSchedules(token)).filter((s) => s.name.includes(name));
// }

/// Returns a list of all schedules saved by this user
export async function getSchedules(token: User): Promise<UserSavedSchedule[]> {
  const response = await (
    await fetch("/api/user/schedules", {
      method: "GET",
      headers: {
        "X-Google-Token": token.cred
      }
    })
  ).json();
  if (response.error !== undefined) {
    return [];
  } else {
    return response;
  }
}
