import { SemesterType, CourseType } from "./four_year_plan";
import { userMajor } from "../services/user";
//  Returns if a course is already in a semester's index
export function courseAlreadyInSemester(course: CourseType, semesterIndex: number, semesters: SemesterType[]): boolean {
  if (semesterIndex > -1 && semesterIndex < semesters.length) {
    semesters[semesterIndex].courses.forEach((x: any) => {
      if (x === course) {
        return true;
      }
    });
  }
  return false;
}

//  Get all courses in previous semesters
//  param semesterIndex -> current semester index
export function getPreviousSemesterCourses(semesterIndex: number, semesters: SemesterType[]): Array<string> {
  const previousCourses = new Array<string>();
  if (semesterIndex > -1 && semesterIndex < semesters.length) {
    semesters.forEach((currSemester) => {
      if (currSemester.semesterNumber - 1 < semesterIndex) {
        currSemester.courses.forEach((x: any) => {
          previousCourses.push(x.subject + "-" + x.number);
        });
      }
    });
  }

  //  Append completed courses to the array
  userMajor()?.completed_courses.forEach((x: string) => {
    previousCourses.push(x);
  });

  return previousCourses;
}

//  Get all Course objects in current semester
//  param semesterIndex -> current semester index
export function getSemesterCourses(semesterIndex: number, semesters: SemesterType[]): Array<CourseType> {
  const semCourses = new Array<CourseType>();
  if (semesterIndex > -1 && semesterIndex < semesters.length) {
    semesters[semesterIndex].courses.forEach((x: any) => {
      semCourses.push(x);
    });
  }
  return semCourses;
}

//  Get all courses (string) in current semester
//  param semesterIndex -> current semester index
export function getSemesterCoursesNames(semesterIndex: number, semesters: SemesterType[]): Array<string> {
  const semCourses = new Array<string>();
  if (semesterIndex > -1 && semesterIndex < semesters.length) {
    semesters[semesterIndex].courses.forEach((x: CourseType) => {
      semCourses.push(x.subject + "-" + x.number);
    });
  }
  return semCourses;
}
