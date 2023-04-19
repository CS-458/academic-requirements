import React, { FC, useEffect, memo, useCallback, useState } from "react";
import { CourseList } from "./CourseList";
import StringProcessing from "../entities/StringProcessing";
import { ItemTypes } from "../entities/Constants";
import { AlertProps, Snackbar, Alert as MuiAlert } from "@mui/material";
import RequirementsProcessing from "../entities/requirementsProcessing";
import { userMajor } from "../services/user";
import {
  CourseType,
  RequirementComponentType,
  SemesterType,
  FourYearPlanType,
  MultipleCategoriesType,
  warning,
  season,
  sortSemester,
  UserSavedSchedule,
  movedCourse,
  ScheduleData
} from "../entities/four_year_plan";
import {
  processRequirementLists,
  createMultipleCategoryList
} from "../entities/requirementsHelperFunctions";
import SemesterList, { deepCopy } from "./SemesterList";
import CourseFiltering from "./CourseFiltering";
import ActionBar from "./ActionBar";
import InformationDrawer from "./InformationBar";
import ScheduleErrorNotification from "./ScheduleErrorNotifications";
import UndoButton from "./UndoButton";
import RedoButton from "./RedoButton";
import ReloadPage from "./ReloadPage";

export interface CourseError {
  id: number;
  sem: number;
}

let undo = false;
let redo = false;

export const FourYearPlanPage: FC<FourYearPlanType> = memo(
  function FourYearPlanPage({
    PassedCourseList, // The combination of major, concentration, and gen ed
    requirements, // List of requirements for major/concentration
    requirementsGen // List of requirements for gen-eds
  }) {
    // this will update if you pull in a saved schedule with more than 8 semesters
    // defaults to 8 for a standard schedule
    const [semesters, setSemesters] = useState<SemesterType[]>(
      initializeSemesters()
    );
    // The visibility of the error message
    const [visibility, setVisibility] = useState(false);
    const [severity, setSeverity] = useState<any>(undefined);
    const [error, setError] = useState("");

    function throwError(error: string, errorSeverity: string): void {
      setVisibility(true);
      setError(error);
      setSeverity(errorSeverity);
    }

    const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
      props,
      ref
    ) {
      return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
    });
    const handleClose = (
      _event?: React.SyntheticEvent | Event,
      reason?: string
    ): void => {
      if (reason === "clickaway") {
        return;
      }
      setVisibility(false);
    };

    //  A list of courses that should have a warning color on them
    const [warningPrereq, setWarningPrereq] = useState<CourseError[]>([]);
    const [warningFallvsSpringCourses, setWarningFallvsSpringCourses] =
      useState<CourseError[]>([]);
    const [warningDupCourses, setWarningDupCourses] = useState<CourseError[]>(
      []
    );
    //  Warning for spring/fall semester
    const [updateWarning, setUpdateWarning] = useState<{
      course: CourseType | undefined;
      oldSemester: number;
      newSemester: number;
      draggedOut: boolean;
      newCheck: boolean;
    }>({
      course: undefined,
      oldSemester: -1,
      newSemester: -1,
      draggedOut: true,
      newCheck: false
    });
    // fourYearPlan parsed as a JSON
    const [fourYearPlan] = useState(
      JSON.parse(userMajor()?.concentration?.fourYearPlan ?? "{}")
    );
    // The list of requirements and their completion for display
    type Reqs = RequirementComponentType[];
    const [requirementsDisplay, setRequirementsDisplay] = useState<Reqs>([]);

    // Requirements that are manipulated
    const [reqList, setReqList] = useState<Reqs | null | undefined>(
      requirements
    );
    const [reqGenList, setReqGenList] = useState<Reqs | null | undefined>(
      requirementsGen
    );

    //  A list of all courses that are in more than one categories, for use with requirements
    const [coursesInMultipleCategories, setCoursesInMultipleCategories] =
      useState<MultipleCategoriesType[]>([]);

    // Stuff for category dropdown.
    const [coursesInCategory, setCoursesInCategory] = useState<CourseType[]>(
      []
    ); // courses in category that is selected

    // lists of courses for undoing and redoing course moves
    const [coursesMoved, setCoursesMoved] = useState<movedCourse[]>([]);
    const [coursesForRedo, setCoursesForRedo] = useState<movedCourse[]>([]);

    function initializeSemesters(): SemesterType[] {
      const tempSemesters: SemesterType[] = [];
      let i = 0;
      for (let year = 1; year < 5; year++) {
        [season.Fall, season.Spring].forEach((s) => {
          tempSemesters.push({
            accepts: [ItemTypes.COURSE],
            courses: [],
            semesterNumber: i++,
            SemesterCredits: 0,
            Warning: null,
            year,
            season: s
          });
        });
      }
      for (let year = 1; year < 5; year++) {
        [season.Winter, season.Summer].forEach((s) => {
          tempSemesters.push({
            accepts: [ItemTypes.COURSE],
            courses: [],
            semesterNumber: i++,
            SemesterCredits: 0,
            Warning: null,
            year,
            season: s
          });
        });
      }
      return tempSemesters;
    }

    // useEffect(() => {
    //   if (importData !== undefined) {
    //     selectedConcentration = importData.Concentration;
    //   }
    // }, [importData]);

    const handleDrop = useCallback(
      (semNumber: number, item: { idCourse: number; dragSource: string }) => {
        const { idCourse, dragSource } = item;
        console.log("Drop", semNumber, idCourse, dragSource);
        const tmpSemesters = deepCopy(semesters);
        undo = false;
        redo = false;
        const target = tmpSemesters.find(
          (sem) => sem.semesterNumber === semNumber
        );
        if (target == null) throw new Error("Drop target not found");
        const course = PassedCourseList.find((c) => c.idCourse === idCourse);
        if (course == null) throw new Error("Course not found");
        if (target.courses.some((c) => c.idCourse === idCourse)) return;
        let source: SemesterType | undefined;
        if (dragSource !== "CourseList") {
          const sourceId = +dragSource.split(" ")[1];
          source = tmpSemesters.find((sem) => sem.semesterNumber === sourceId);
          if (source == null) throw new Error("Source semester not found");
          source.courses = source.courses.filter(
            (c) => c.idCourse !== idCourse
          );
        } else {
          checkRequirements(course, coursesInMultipleCategories);
        }
        course.dragSource = `Semester ${semNumber}`;
        target.courses.push(course);
        setSemesters(tmpSemesters);
        setUpdateWarning({
          course,
          oldSemester: tmpSemesters.findIndex(
            (s) => s.semesterNumber === source?.semesterNumber
          ),
          newSemester: tmpSemesters.findIndex(
            (s) => s.semesterNumber === target.semesterNumber
          ),
          draggedOut: true,
          newCheck: true
        });
      },
      [
        semesters,
        coursesInMultipleCategories,
        reqList,
        reqGenList,
        PassedCourseList
      ]
    );
    // handle a drop into the course list from a semester
    const handleReturnDrop = useCallback(
      (item: { idCourse: number; dragSource: string }) => {
        const { idCourse, dragSource } = item;
        console.log("Calling return drop", idCourse, dragSource);
        // ignore all drops from the course list
        if (dragSource !== "CourseList") {
          createCourseMoveRecord(
            -2,
            idCourse,
            parseInt(dragSource.split(" ")[1])
          );
          const tempSemesters = deepCopy(semesters);
          const movedFromNum = +dragSource.split(" ")[1];
          const semesterIndex = tempSemesters.findIndex(
            (s) => s.semesterNumber === movedFromNum
          );
          const courseIndex = tempSemesters[semesterIndex].courses.findIndex(
            (c) => c.idCourse === idCourse
          );

          if (courseIndex !== -1) {
            const course = tempSemesters[semesterIndex]?.courses[courseIndex];
            if (
              warningDupCourses.findIndex((c) => c.id === course.idCourse) ===
              -1
            ) {
              removeFromRequirements(course);
            }
            setUpdateWarning({
              course,
              oldSemester: semesterIndex,
              newSemester: -1,
              draggedOut: true,
              newCheck: true
            });
          }
          tempSemesters[semesterIndex].courses.splice(courseIndex, 1);
          setSemesters(tempSemesters);
        }
      },
      [PassedCourseList, semesters]
    );

    const [savedErrors, setSavedErrors] = useState<string[]>([]);

    useEffect(() => {
      if (updateWarning.newCheck) {
        const errors: string[] = [];

        const duplicateCourses: CourseError[] = [];
        for (let i = 0; i < semesters.length; i++) {
          for (let j = i + 1; j < semesters.length; j++) {
            semesters[i].courses.forEach((c) => {
              if (!c.repeatableForCred) {
                const dup = semesters[j].courses.find(
                  (c2) => c.idCourse === c2.idCourse
                );
                if (dup !== undefined) {
                  errors.push(
                    `Duplicate Course found: ${c.subject}-${c.number}`
                  );
                  duplicateCourses.push({
                    id: c.idCourse,
                    sem: semesters[i].semesterNumber
                  });
                  duplicateCourses.push({
                    id: dup.idCourse,
                    sem: semesters[j].semesterNumber
                  });
                }
              }
            });
          }
        }
        setWarningDupCourses(duplicateCourses);

        const fallSpringCourses: CourseError[] = [];
        semesters.forEach((sem) => {
          sem.courses.forEach((c) => {
            if (c.semesters === "FA" && sem.season !== season.Fall) {
              fallSpringCourses.push({
                id: c.idCourse,
                sem: sem.semesterNumber
              });
              errors.push(
                `${c.subject}-${c.number} is only offered in the fall`
              );
            } else if (c.semesters === "SP" && sem.season !== season.Spring) {
              fallSpringCourses.push({
                id: c.idCourse,
                sem: sem.semesterNumber
              });
              errors.push(
                `${c.subject}-${c.number} is only offered in the spring`
              );
            }
          });
        });
        setWarningFallvsSpringCourses(fallSpringCourses);

        const preReqCourses: CourseError[] = [];
        let takenCourses: string[] = userMajor()?.completed_courses ?? [];
        const sp = new StringProcessing();
        semesters.sort(sortSemester).forEach((sem) => {
          const concurrent = sem.courses.map((c) => `${c.subject}-${c.number}`);
          sem.courses.forEach((c) => {
            const val = sp.courseInListCheck(
              c.preReq,
              takenCourses,
              concurrent
            );
            if (!val.returnValue) {
              preReqCourses.push({ id: c.idCourse, sem: sem.semesterNumber });
              errors.push(
                `${c.subject}-${c.number} requires: ${val.failedString}`
              );
            }
          });
          takenCourses = takenCourses.concat(concurrent);
        });
        setWarningPrereq(preReqCourses);

        const tempSemesters = deepCopy(semesters);
        tempSemesters.forEach((sem) => {
          sem.SemesterCredits = sem.courses.reduce((a, b) => a + b.credits, 0);
          sem.Warning = getWarning(sem);
        });
        setSemesters(tempSemesters);

        const newErrors = errors.filter((e) => !savedErrors.includes(e));
        if (newErrors.length > 0) {
          setVisibility(true);
          throwError(newErrors.join("<br>"), "error");
        }
        setSavedErrors(errors);
      }
      setUpdateWarning({
        course: undefined,
        oldSemester: -1,
        newSemester: -1,
        draggedOut: true,
        newCheck: false
      });
    }, [semesters]);

    function getSemesterDataForSaving(): ScheduleData {
      const schedule: ScheduleData = [];
      semesters.forEach((s) => {
        let saveYear = schedule.find((y) => y.year === s.year);
        if (saveYear === undefined) {
          saveYear = { year: s.year, seasons: [] };
          schedule.push(saveYear);
        }
        let saveSeason = saveYear.seasons.find(
          (season) => season.season === s.season
        );
        if (saveSeason === undefined) {
          saveSeason = { season: s.season, classes: [] };
          saveYear.seasons.push(saveSeason);
        }
        s.courses.forEach((c) => {
          saveSeason?.classes.push(`${c.subject}-${c.number}`);
        });
      });
      return schedule;
    }
    //  JSON Data for the Courses
    const info: UserSavedSchedule["scheduleData"] = {
      Major: userMajor()?.major.id ?? -1,
      Concentration: userMajor()?.concentration.idConcentration ?? -1,
      "Completed Courses": userMajor()?.completed_courses ?? [],
      schedule: getSemesterDataForSaving(),
      usedFourYearPlan: userMajor()?.load_four_year_plan ?? false
    };

    //  This function sets the correct warning for the semester
    const getWarning = (sem: SemesterType): warning | null => {
      const credits = sem.SemesterCredits;
      if (credits === 0) {
        return null;
      } else if (sem.season === season.Fall || sem.season === season.Spring) {
        if (credits <= 11) return warning.Low;
        else if (credits >= 19) return warning.High;
        else return null;
        // This if statement below adds in a upper limit for the Winter Semester
      } else if (sem.season === season.Winter) {
        if (credits >= 5) return warning.High;
        else return null;
        // The Else if below adds in a upper limit for Summer Semester
      } else if (sem.season === season.Summer) {
        if (credits >= 13) return warning.High;
        else return null;
      } else {
        if (credits >= 8) return warning.High;
        else return null;
      }
    };

    // this prevents the requirements from resetting on a page rerender (leaving page and coming back)
    const [ran, setRan] = useState<boolean>(false);
    // get all of the requirements
    useEffect(() => {
      // don't proceed if there are no requirements
      if (
        requirements === undefined ||
        requirements === null ||
        requirementsGen === undefined ||
        requirementsGen === null
      ) {
        return;
      }
      if (ran) {
        return;
      }
      const response = processRequirementLists(requirements, requirementsGen);
      setReqList(response.req);
      setReqGenList(response.reqGen);
      setRequirementsDisplay(response.display);
      setRan(true);
    }, [requirements, requirementsGen, PassedCourseList]);

    // This use effect creates a list of all courses that can fill more than one requirement
    useEffect(() => {
      // get the courses with more than one category they can satisfy
      setCoursesInMultipleCategories(
        createMultipleCategoryList(PassedCourseList)
      );
    }, [PassedCourseList]);

    // This prevents the data from resetting when you click off the page
    const [alreadySetThisData, setAlreadySetThisData] = useState(false);
    // fill in the schedule and check requirements on import or four year plan
    useEffect(() => {
      if (
        coursesInMultipleCategories.length !== 0 &&
        reqList != null &&
        reqGenList != null &&
        !alreadySetThisData
      ) {
        userMajor()?.completed_courses.forEach((x) => {
          const a = x.split("-");
          const found = PassedCourseList.find(
            (item) => item.subject === a[0] && item.number === a[1]
          );
          if (found !== undefined) {
            checkRequirements(found, coursesInMultipleCategories);
          }
        });
        const scheduleToLoad = localStorage.getItem("current-schedule");
        if (scheduleToLoad !== null) {
          const semesters: SemesterType[] = [];
          const schedule: ScheduleData = JSON.parse(scheduleToLoad);
          console.log("Loading", schedule);
          schedule.forEach(({ year, seasons }) =>
            seasons.forEach(({ season, classes }) => {
              let semester = semesters.find(
                (s) => s.season === season && s.year === year
              );
              if (semester === undefined) {
                semester = {
                  year,
                  season,
                  accepts: [ItemTypes.COURSE],
                  courses: [],
                  SemesterCredits: 0,
                  Warning: null,
                  semesterNumber:
                    semesters.reduce(
                      (max, s) => Math.max(max, s.semesterNumber),
                      0
                    ) + 1
                };
                semesters.push(semester);
              }
              classes.forEach((c) => {
                const [subject, number] = c.split("-");
                const course = PassedCourseList.find(
                  (c) => c.subject === subject && c.number === number
                );
                if (course !== undefined) {
                  semester?.courses.push(course);
                  checkRequirements(course, coursesInMultipleCategories);
                }
              });
            })
          );
          for (let year = 0; year < 4; year++) {
            Object.values(season).forEach((season) => {
              if (
                semesters.find(
                  (s) => s.year === year && s.season === season
                ) === undefined
              ) {
                semesters.push({
                  year,
                  season,
                  accepts: [ItemTypes.COURSE],
                  courses: [],
                  SemesterCredits: 0,
                  Warning: null,
                  semesterNumber:
                    semesters.reduce(
                      (max, s) => Math.max(max, s.semesterNumber),
                      0
                    ) + 1
                });
              }
            });
          }
          semesters.forEach((s) => {
            s.SemesterCredits = s.courses.reduce(
              (sum, c) => c.credits + sum,
              0
            );
            s.Warning = getWarning(s);
          });
          setSemesters(semesters);
          setUpdateWarning({
            course: undefined,
            oldSemester: -1,
            newSemester: -1,
            draggedOut: true,
            newCheck: true
          });
        } else if (userMajor()?.load_four_year_plan === true) {
          loadFYP(semesters);
        }
        setAlreadySetThisData(true);
      }
    }, [coursesInMultipleCategories]);

    function loadFYP(semesters: SemesterType[]): void {
      // fill in the schedule
      semesters.forEach((semester, index) => {
        const tempArr: CourseType[] = [];
        // Get the semester data from the json
        const classPlan = fourYearPlan.ClassPlan["Semester" + (index + 1)];
        if (classPlan == null) return;
        const courseStringArr = classPlan.Courses;
        let credits = 0;
        // loop through each course in the list
        courseStringArr.forEach((courseString: String) => {
          const subject = courseString.split("-")[0];
          const number = courseString.split("-")[1];
          let course: CourseType | undefined;
          // This variable prevents the course being added twice if it is in
          // more than one category
          let foundOnce = false;
          // Find the course in the master list of courses
          PassedCourseList.forEach((x) => {
            if (
              x.subject === subject &&
              x.number === number &&
              userMajor()?.completed_courses.find(
                (y) => y === x.subject + "-" + x.number
              ) === undefined
            ) {
              if (!foundOnce) {
                // define the course and update it as needed
                course = x;
                course.dragSource = "Semester" + (index + 1);
                checkRequirements(course, coursesInMultipleCategories);
                foundOnce = true;
              }
            }
            // If there is a course add it to the temporary array for the semester
          });
          if (course !== undefined) {
            tempArr.push(course);
            credits += course.credits;
          }
        });
        // update the necessary semester values
        semester.courses = tempArr;
        semester.SemesterCredits = credits;
        const newWarningState = getWarning(semester);
        semester.Warning = newWarningState;
      });
      setSemesters(semesters);
    }

    // called when a course is removed from the schedule to remove it from reqs
    const removeFromRequirements = useCallback(
      (course: CourseType) => {
        const reqCheck = new RequirementsProcessing();
        const updatedRequirements = reqCheck.removeCourseFromRequirements(
          course,
          reqGenList,
          reqList
        );
        setReqGenList(updatedRequirements.gen);
        setReqList(updatedRequirements.major);
      },
      [reqList, reqGenList, requirements, requirementsGen]
    );

    // called when a course is added to the schedule to add it to reqs
    const checkRequirements = useCallback(
      (course: CourseType, multipleCategories: any) => {
        if (
          reqList !== null &&
          reqList !== undefined &&
          reqGenList !== null &&
          reqGenList !== undefined
        ) {
          const reqCheck = new RequirementsProcessing();
          // check for any major/concentration reqs it can fill
          const Major = reqCheck.majorReqCheck(course, reqList);
          setReqList(Major.reqList);
          if (!Major.addedCourse) {
            // check if it fills any unfilled gen-ed requirements
            setReqGenList(
              reqCheck.checkRequirementsGen(
                course,
                multipleCategories,
                reqGenList,
                PassedCourseList
              )
            );
          }
        }
      },
      [reqList, reqGenList, requirementsDisplay, PassedCourseList]
    );

    function resetRequirements(): void {
      // reset the major requirements
      const tempList = reqList;
      tempList?.forEach((req) => {
        req.courseCountTaken = 0;
        req.creditCountTaken = 0;
        req.coursesTaken = "";
        req.percentage = 0;
      });
      // reset the gen ed requirements
      const tempList2 = reqGenList;
      tempList2?.forEach((req) => {
        req.courseCountTaken = 0;
        req.creditCountTaken = 0;
        req.coursesTaken = "";
        req.percentage = 0;
      });
      setReqList(tempList);
      setReqGenList(tempList2);
      // add completed courses back in
      userMajor()?.completed_courses.forEach((x) => {
        const a = x.split("-");
        const found = PassedCourseList.find(
          (item) => item.subject === a[0] && item.number === a[1]
        );
        if (found !== undefined) {
          checkRequirements(found, coursesInMultipleCategories);
        }
      });
    }

    function handleUndoCourse(): void {
      const move = coursesMoved.pop();
      try {
        if (move !== undefined) {
          undo = true;
          const temp = coursesForRedo;
          temp.push({
            movedTo: move.movedFrom,
            movedFrom: move.movedTo,
            course: move.course
          });
          setCoursesForRedo(temp);
          // course came from the courseList, so move it back
          if (move.movedFrom === -2) {
            handleReturnDrop({
              idCourse: move.course,
              dragSource: "Semester " + move.movedTo
            });
          } else if (move.movedTo === -2) {
            handleDrop(move.movedFrom, {
              idCourse: move.course,
              dragSource: "CourseList"
            });
          } else {
            handleDrop(move.movedFrom, {
              idCourse: move.course,
              dragSource: "Semester " + move.movedTo
            });
          }
        }
      } catch (error: any) {
        throwError(
          "Undo Error: It's possible the Year has been deleted and cannot be accessed.",
          "warning"
        );
      }
    }

    function handleRedoCourse(): void {
      const move = coursesForRedo.pop();
      try {
        if (move !== undefined) {
          redo = true;
          createCourseMoveRecord(move.movedFrom, move.course, move.movedTo);
          // course came from the courseList, so move it back
          if (move.movedFrom === -2) {
            handleReturnDrop({
              idCourse: move.course,
              dragSource: "Semester " + move.movedTo
            });
          } else if (move.movedTo === -2) {
            // was moved to course list
            handleDrop(move.movedFrom, {
              idCourse: move.course,
              dragSource: "CourseList"
            });
          } else {
            handleDrop(move.movedFrom, {
              idCourse: move.course,
              dragSource: "Semester " + move.movedTo
            });
          }
        }
      } catch (error: any) {
        throwError(
          "Redo Error: It's possible the Year has been deleted and cannot be accessed.",
          "warning"
        );
      }
    }

    function createCourseMoveRecord(
      semNumber: number,
      courseId: number,
      dragSource: number
    ): void {
      if (!redo && !undo) {
        setCoursesForRedo([]);
      }
      if (!undo) {
        const temp = coursesMoved;
        temp.push({
          movedTo: semNumber,
          movedFrom: dragSource,
          course: courseId
        });
        setCoursesMoved(temp);
      } else {
        undo = false;
      }
    }

    return (
      <div className="generic">
        <div className="drag-drop">
          <ActionBar
            scheduleData={info}
            sems={semesters}
            resetRequirements={resetRequirements}
            setAlertData={throwError}
            handleReturn={handleReturnDrop}
            setSemesters={setSemesters}
            setSavedErrors={setSavedErrors}
            resetRedo={setCoursesForRedo}
            resetMoved={setCoursesMoved}
            defaultName={userMajor()?.schedule_name}
          >
            <ScheduleErrorNotification errors={savedErrors} />
            <br />
            <UndoButton
              handleUndoCourse={handleUndoCourse}
              courses={coursesMoved}
            />
            <br />
            <RedoButton
              handleRedoCourse={handleRedoCourse}
              courses={coursesForRedo}
            />
            <br />
            <ReloadPage
              scheduleData={info}
              sems={semesters}
              resetRequirements={resetRequirements}
              handleReturn={handleReturnDrop}
              setSemesters={setSemesters}
              setSavedErrors={setSavedErrors}
              resetRedo={setCoursesForRedo}
              resetMoved={setCoursesMoved}
              loadFYP={loadFYP}
              initializeSemesters={initializeSemesters}
            />
          </ActionBar>
          <div style={{ overflow: "hidden", clear: "both" }}>
            <Snackbar
              open={visibility}
              autoHideDuration={6000}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              data-testid="snackbar"
            >
              <Alert
                onClose={handleClose}
                severity={severity}
                sx={{ width: "100%" }}
              >
                {`${error}`}
              </Alert>
            </Snackbar>
            <SemesterList
              semesters={semesters}
              warningPrerequisiteCourses={warningPrereq}
              warningFallvsSpringCourses={warningFallvsSpringCourses}
              warningDuplicateCourses={warningDupCourses}
              PassedCourseList={PassedCourseList}
              setSemesters={setSemesters}
              checkRequirements={checkRequirements}
              coursesInMultipleCategories={coursesInMultipleCategories}
              setUpdateWarning={setUpdateWarning}
              reqList={reqList ?? []}
              reqGenList={reqGenList ?? []}
              createCourseMoveRecord={createCourseMoveRecord}
              error={throwError}
            />
          </div>
          <div
            style={{ overflow: "hidden", clear: "both" }}
            className="class-dropdown generic"
          >
            <CourseFiltering
              courseData={PassedCourseList}
              onFiltered={(courses: CourseType[]) => {
                setCoursesInCategory(courses);
              }}
            />
            <CourseList
              accept={[ItemTypes.COURSE]}
              onDrop={(item) => handleReturnDrop(item)}
              courses={coursesInCategory}
              key={0}
            />
          </div>
          <InformationDrawer
            requirementsDisplay={requirementsDisplay}
            semesters={semesters}
            passedCourseList={PassedCourseList}
          />
        </div>
      </div>
    );
  }
);

export { FourYearPlanPage as default };
