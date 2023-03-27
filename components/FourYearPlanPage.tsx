import update from "immutability-helper";
import React, { FC, useEffect, memo, useCallback, useState } from "react";
import { CourseList } from "./CourseList";
import StringProcessing from "../entities/StringProcessing";
import { ItemTypes } from "../entities/Constants";
import SearchableDropdown from "./SearchableDropdown";
import { Requirement } from "./Requirement";
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
  sortSemester
} from "../entities/four_year_plan";
import { getSemesterCoursesNames } from "../entities/prereqHelperFunctions";
import {
  processRequirementLists,
  createMultipleCategoryList
} from "../entities/requirementsHelperFunctions";
import SemesterList, { deepCopy } from "./SemesterList";
import CourseFiltering from "./CourseFiltering";
import ActionBar from "./ActionBar";

export interface CourseError {
  id: number;
  sem: number;
}

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
      event?: React.SyntheticEvent | Event,
      reason?: string
    ): void => {
      if (reason === "clickaway") {
        return;
      }
      setVisibility(false);
    };

    //  A list of courses that should have a warning color on them
    const [warningPrereqCourses, setWarningPrereqCourses] = useState<
      CourseError[]
    >([]);
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
    const [categories, setCategories] = useState<string[]>([]); // list of all categories
    const [coursesInCategory, setCoursesInCategory] = useState<CourseType[]>(
      []
    ); // courses in category that is selected

    // Used to keep track of which information to display in the far right area
    const defaultInformationType = "Requirements (Calculated)"; // The default
    const [informationTypes, setInformationTypes] = useState<string[]>([
      defaultInformationType
    ]);
    type DispInfo = string | undefined;
    const [displayedInformationType, setDisplayedInformationType] =
      useState<DispInfo>(defaultInformationType);

    // create 8 semesters for four years of type Fall and Spring
    // used for the empty schedule or load fourYearPlan
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

    useEffect(() => {
      // Whenever completed courses may update, determine
      // whether we need to display it in the dropdown
      const completedCourses = userMajor()?.completed_courses ?? 0;
      if (completedCourses > 0) {
        console.log(
          "Setting up completed courses",
          userMajor()?.completed_courses
        );
        setInformationTypes((prevInformationTypes) => {
          // the ... is a spread operator and essentially means "take everything up to this point"
          if (!prevInformationTypes.includes("Completed Courses")) {
            return [...prevInformationTypes, "Completed Courses"];
          }
          return [...prevInformationTypes];
        });
      }
      if (userMajor()?.load_four_year_plan !== false) {
        setInformationTypes((prevInformationTypes) => {
          // the ... is a spread operator and essentially means "take everything up to this point"
          if (!prevInformationTypes.includes("Requirements (Four Year Plan)")) {
            return [...prevInformationTypes, "Requirements (Four Year Plan)"];
          }
          return [...prevInformationTypes];
        });
      }
    }, []);

    // useEffect(() => {
    //   if (importData !== undefined) {
    //     selectedConcentration = importData.Concentration;
    //   }
    // }, [importData]);

    // SelectedCategory function.
    function selectedCategory(_category: string | undefined): void {
      // New string array created.
      const set = new Array<CourseType>();
      // Iterate through major course list. If the index matches the category, push the course name of the index to array.
      PassedCourseList.map((course) => {
        if (course.category.valueOf() === _category) {
          set.push(course);
        }
      });
      setCoursesInCategory(set);
    }

    //  Removes duplicate strings from an array
    function RemoveDuplicates(strings: string[]): string[] {
      return strings.filter((value, index, tempArr) => {
        return !tempArr.includes(value, index + 1);
      });
    }

    // extractCategories function.
    function extractCategories(): void {
      // Initialize new array.
      const i = new Array<string>();
      // Push course categories from major and concentration course lists to array.
      PassedCourseList.map((course) => {
        i.push(course.category);
      });
      // Remove duplicate categories from the array.
      const tmp = RemoveDuplicates(i);
      console.log("Categories", tmp);
      setCategories(tmp);
    }

    // handle a drop into the course list from a semester
    const handleReturnDrop = useCallback(
      (item: { idCourse: number; dragSource: string }) => {
        const { idCourse, dragSource } = item;
        console.log("Calling return drop", idCourse, dragSource);
        // ignore all drops from the course list
        if (dragSource !== "CourseList") {
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

    //  This function checks if the course that was moved is in a "valid" fall or spring semester
    function checkCourseSemester(course: CourseType, semNum: number): boolean {
      return (
        (course.semesters === "FA" && semNum % 2 === 1) ||
        (course.semesters === "SP" && semNum % 2 === 0)
      );
    }

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
        setWarningPrereqCourses(preReqCourses);

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

    const popupCloseHandler = (): void => {
      setVisibility(false);
    };

    //  JSON Data for the Courses
    const info = {
      Major: userMajor()?.major.name,
      Concentration: userMajor()?.concentration.name,
      "Completed Courses": userMajor()?.completed_courses,
      ClassPlan: {
        Semester1: getSemesterCoursesNames(0, semesters),
        Semester2: getSemesterCoursesNames(1, semesters),
        Semester3: getSemesterCoursesNames(2, semesters),
        Semester4: getSemesterCoursesNames(3, semesters),
        Semester5: getSemesterCoursesNames(4, semesters),
        Semester6: getSemesterCoursesNames(5, semesters),
        Semester7: getSemesterCoursesNames(6, semesters),
        Semester8: getSemesterCoursesNames(7, semesters)
      }
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
      } else {
        // TODO: check high number of credits for extra semesters
        if (credits >= 8) return warning.High;
        else return null;
      }
    };

    //  A Function that grabs the total credits for the semester
    const getSemesterTotalCredits = (semesterIndex: number): number => {
      let SemesterCredits = 0;
      semesters[semesterIndex].courses.forEach((x: any) => {
        SemesterCredits += Number(x.credits);
      });
      return SemesterCredits;
    };

    /*
    ***
        This is commented out because it is not needed currently
        however, we may want to use it in the futur ***
    ***
    //  Checks for a warning in semester and then throws a warning popup
    const checkWarnings = (): void => {
      const semestersWithWarnings: string[] = [];
      for (let i = 0; i < semesters.length; i++) {
        if (semesters[i].Warning !== null) {
          semestersWithWarnings.push(
            " Semester " + (i + 1) + " is " + semesters[i].Warning
          );
        }
      }
      semestersWithWarnings.push(" Schedule still exported.");

      for (let i = 0; i < semesters.length; i++) {
        if (semesters[i].Warning !== null) {
          setVisibility(true);
          throwError(semestersWithWarnings + "", "warning");
        }
      }
    };
    */

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
      console.log("reqList", reqList);
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
        // check now that we have multiple category data
        if (userMajor()?.load_four_year_plan === true) {
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
        }
        setAlreadySetThisData(true);
      }
    }, [coursesInMultipleCategories]);

    // called when a course is removed from the schedule to remove it from reqs
    const removeFromRequirements = useCallback(
      (course: CourseType) => {
        const reqCheck = new RequirementsProcessing();
        const updatedRequirements = reqCheck.removeCourseFromRequirements(
          course,
          reqGenList,
          reqList
        );
        console.log(updatedRequirements);
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

    return (
      <div className="generic">
        <div className="drag-drop">
          <ActionBar scheduleData={info} setAlertData={throwError} />
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
              warningPrerequisiteCourses={warningPrereqCourses}
              warningFallvsSpringCourses={warningFallvsSpringCourses}
              warningDuplicateCourses={warningDupCourses}
              PassedCourseList={PassedCourseList}
              setSemesters={setSemesters}
              checkRequirements={checkRequirements}
              coursesInMultipleCategories={coursesInMultipleCategories}
              setUpdateWarning={setUpdateWarning}
              reqList={reqList ?? []}
              reqGenList={reqGenList ?? []}
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
          <div className="right-information-box generic">
            <div className="right-information-box-header">
              {informationTypes.length === 1 && (
                <p
                  style={{
                    textAlign: "center",
                    padding: "0px",
                    fontSize: "1.1em"
                  }}
                >
                  {displayedInformationType}
                </p>
              )}
              {informationTypes.length > 1 && (
                <SearchableDropdown
                  options={informationTypes}
                  label={null}
                  onSelectOption={setDisplayedInformationType}
                />
              )}
            </div>
            <div className="right-information-box-content">
              {displayedInformationType === "Requirements (Four Year Plan)" && (
                <>
                  <p className="right-information-box-description">
                    The four year plan for your concentration recommends taking
                    courses in the following categories in the respective
                    semesters.
                  </p>
                  {Object.keys(fourYearPlan.ClassPlan).map((key, index) => {
                    if (fourYearPlan?.ClassPlan[key].Requirements.length > 0) {
                      return (
                        <div style={{ margin: "5px" }} key={index}>
                          <p>{key}</p>
                          <p
                            style={{ marginLeft: "10px", marginBottom: "25px" }}
                          >
                            {fourYearPlan?.ClassPlan[
                              key
                            ].Requirements.toString()}
                          </p>
                        </div>
                      );
                    }
                  })}
                </>
              )}
              {displayedInformationType === "Completed Courses" && (
                <>
                  <p className="right-information-box-description">
                    These are courses you marked as complete.
                  </p>
                  {userMajor()?.completed_courses?.map((completedCourse) => {
                    return (
                      <div className="info-box-completed-course">
                        <a
                          href={
                            "https://bulletin.uwstout.edu/content.php?filter%5B27%5D=" +
                            completedCourse.split("-")[0] +
                            "&filter%5B29%5D=" +
                            completedCourse.split("-")[1] +
                            "&filter%5Bcourse_type%5D=-1&filter%5Bkeyword%5D=&filter%5B32%5D=1&filter%5Bcpage%5D=1&cur_cat_oid=21&expand=&navoid=544&search_database=Filter#acalog_template_course_filter"
                          }
                          target="_blank"
                        >
                          {completedCourse}
                        </a>
                      </div>
                    );
                  })}
                </>
              )}
              {displayedInformationType === "Requirements (Calculated)" && (
                <>
                  <p className="right-information-box-description">
                    Select a category and drag a course onto a semester to begin
                    planning.
                  </p>
                  {requirementsDisplay?.map(
                    (
                      {
                        name,
                        courseCount,
                        courseReqs,
                        creditCount,
                        idCategory,
                        parentCategory,
                        percentage,
                        inheritedCredits,
                        coursesTaken,
                        courseCountTaken,
                        creditCountTaken
                      },
                      index
                    ) => (
                      <Requirement
                        courseCount={courseCount}
                        courseReqs={courseReqs}
                        creditCount={creditCount}
                        idCategory={idCategory}
                        name={name}
                        parentCategory={parentCategory}
                        percentage={percentage}
                        inheritedCredits={inheritedCredits}
                        coursesTaken={coursesTaken}
                        courseCountTaken={courseCountTaken}
                        creditCountTaken={creditCountTaken}
                        key={index}
                      />
                    )
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export { FourYearPlanPage as default };
