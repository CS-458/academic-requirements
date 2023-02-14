export interface UserMajor {
  /// Major ID number
  major: number;
  /// Concentration ID number
  concentration: number;
  /// Whether to load a four year plan
  load_four_year_plan: boolean;
  /// A list of completed course ID numbers
  completed_courses: number[];
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
