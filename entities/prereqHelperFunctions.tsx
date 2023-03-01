import { SemesterType, CourseType } from "./four_year_plan";
import { userMajor } from "../services/user";
import StringProcessing from "./StringProcessing";
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
function getPreviousSemesterCourses(semesterIndex: number, semesters: SemesterType[]): Array<string> {
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
function getSemesterCourses(semesterIndex: number, semesters: SemesterType[]): Array<CourseType> {
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

//  This function checks if every course passes the prerequisite check when moving a course
//  out of a semester
export function preReqCheckAllCoursesPastSemester(
  courseToRemove: CourseType,
  courseSemesterIndex: number,
  showMessage: boolean,
  movedRight: boolean,
  draggedOut: boolean,
  semesters: SemesterType[],
  warningPrerequisiteCourses: CourseType[]
): { vis: boolean, error: string, warning: CourseType[] } {
  // prereqCheck will be used to check prerequisites
  const preReqCheck = new StringProcessing();

  let visibility = false;
  let errorMessage = "";
  let setWarning: CourseType[] = [];

  //  Get the course names in the previous semesters
  const previousCourses = getPreviousSemesterCourses(courseSemesterIndex === -1 ? 0 : courseSemesterIndex, semesters);

  //  Get the current courses in the current semester
  let currentCourses = getSemesterCourses(courseSemesterIndex === -1 ? 0 : courseSemesterIndex, semesters);
  let currentCoursesNames = getSemesterCoursesNames(courseSemesterIndex === -1 ? 0 : courseSemesterIndex, semesters);

  const failedCoursesList = new Array<CourseType>();
  const failedCoursesNoWarning = new Array<CourseType>();

  semesters.forEach((currSemester, index) => {
    if (currSemester.semesterNumber - 1 >= courseSemesterIndex) {
      //  Check every course in the current semester passes the prerequisites and push any failed
      //  prerequisites to the failedCoursesList
      currentCourses.forEach((x) => {
        if (
          !preReqCheck.courseInListCheck(
            x !== undefined ? x.preReq : "",
            previousCourses,
            currentCoursesNames
          ).returnValue
        ) {
          failedCoursesList.push(x);
        }
        //  If the course prereq fails, but not due to moving the course,
        //  add it to the failedCoursesNoWarning list
        console.log("previous", previousCourses);
        console.log("current", currentCourses);
        if (
          !preReqCheck.courseInListCheck(
            x !== undefined ? x.preReq : "",
            previousCourses,
            currentCoursesNames
          )
            .failedString.includes(courseToRemove.subject + "-" + courseToRemove.number)
        ) {
          console.log("setting it");
          failedCoursesNoWarning.push(x);
        }
      });

      //  Append the current semester to the previous courses semester
      currentCoursesNames.forEach((x) => {
        previousCourses.push(x);
      });

      //  Update the current course lists to be for the next semester
      if (index + 1 < semesters.length && semesters[index + 1].courses !== undefined) {
        currentCourses = getSemesterCourses(index + 1, semesters);
        currentCoursesNames = getSemesterCoursesNames(index + 1, semesters);
      }
    }
  });

  //  Prepping variables for modifying warningPrerequisitesCourses
  let found = false;
  let tempWarningCourses = warningPrerequisiteCourses;
  const initialPreviousCourses = new Array<CourseType>();

  //  Add previous courses to initialPreviousCourses (the course object, not the strings)
  semesters.forEach((x, index) => {
    if (index < courseSemesterIndex) {
      x.courses.forEach((y: any) => {
        initialPreviousCourses.push(y);
      });
    }
  });

  // Remove any courses that were marked as warning, but now have resolved prerequisites
  if (!movedRight) {
    warningPrerequisiteCourses.forEach((currentWarningCourse) => {
      if (initialPreviousCourses.find((prevCourse) => prevCourse === currentWarningCourse) === undefined) {
        failedCoursesList.forEach((currentFailedCourse) => {
          if (currentWarningCourse === currentFailedCourse) {
            found = true;
          }
        });

        //  If the currently selected course in the warningCourses now passes the prerequisites
        if (!found) {
          const temp = new Array<CourseType>();
          //  Replace warningCourses with all courses but the currently selected warningCourse
          tempWarningCourses.forEach((temporaryCurrentWarningCourse) => {
            //  Carry on if the tempWarningCourse is not in a previous semester
            if (temporaryCurrentWarningCourse !== currentWarningCourse) {
              temp.push(temporaryCurrentWarningCourse);
            }
          });
          tempWarningCourses = temp;
        }
        found = false;
      }
    });

    //  Update the warning courses to remove the currently now-satisifed prereqs course
    setWarning = tempWarningCourses;
  }

  //  If any courses have failed, notify the user of each course that failed
  if (showMessage && failedCoursesList.length > 0) {
    console.log("creating message");
    let message = "";
    //  Push each failed course to the warningCourses
    console.log("list", failedCoursesList);
    failedCoursesList.forEach((x) => {
      if (warningPrerequisiteCourses.find((z) => z === x) === undefined) {
        const temp = warningPrerequisiteCourses;
        temp.push(x);
        setWarning = temp;
      }
      //  If the course is failing, but not due to the latest course move, modify the warning message
      console.log(failedCoursesNoWarning);
      console.log(x);
      if (failedCoursesNoWarning.find((z) => z === x) === undefined) {
        console.log("writing");
        message.length > 0 ? (message = message + "," + x.subject + "-" + x.number) : (message = message + x.subject + "-" + x.number);
      }
    });
    //  Show a warning stating that the classes failed the prereqs
    console.log(!message.includes(courseToRemove.subject + "-" + courseToRemove.number));
    console.log(message.length);
    if (!message.includes(courseToRemove.subject + "-" + courseToRemove.number) && message.length > 0) {
      console.log("here");
      visibility = true;
      errorMessage = "WARNING! " + courseToRemove.subject + "-" + courseToRemove.number +
        " is a prerequisite for the following courses: " + message;
    }
  }

  return { vis: visibility, error: errorMessage, warning: setWarning };
}
