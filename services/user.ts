import React from "react";
import { ConcentrationType, MajorType } from "../entities/four_year_plan";
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
}

export function userMajor(): UserMajor | undefined {
  const data = window.localStorage.getItem("user_major");
  if (data !== null) {
    // console.log(data);
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
export async function uploadSchedule(name: string, schedule: any): Promise<void> {
  const token = userToken();
  if (token === undefined) {
    throw new Error("User is not logged in");
  }
  await fetchApi(`/api/inserts/schedule?name=${name}`, {
    method: "POST",
    body: JSON.stringify(schedule),
    headers: {
      "X-Google-Token": token
    }
  });
}
/*
  Function used to store user into the user table
  May not since we are checking if the user exists
  when uploading the schedule
*/
export async function saveLoggedInUser(): Promise<void> {
  const token = userToken();
  if (token === undefined) {
    throw new Error("User Token Not made");
  }
  await fetchApi("/api/inserts/user", {
    method: "POST",
    headers: {
      "X-Google-Token": token
    }
  });
}
