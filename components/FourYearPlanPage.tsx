import update from "immutability-helper";
import React, { FC, useEffect, memo, useCallback, useState } from "react";
import { Semester } from "./Semester";
import { CourseList } from "./CourseList";
import StringProcessing from "../entities/StringProcessing";
import { ItemTypes } from "../entities/Constants";
import SearchableDropdown from "./SearchableDropdown";
import { Requirement } from "./Requirement";
import { Snackbar } from "@mui/material";
import RequirementsProcessing from "../entities/requirementsProcessing";
import { userMajor } from "../services/user";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { CourseType, RequirementComponentType, SemesterType, FourYearPlanType, MultipleCategoriesType, warning, season } from "../entities/four_year_plan";
import { courseAlreadyInSemester, getSemesterCoursesNames, preReqCheckAllCoursesPastSemester } from "../entities/prereqHelperFunctions";
import { processRequirementLists, createMultipleCategoryList } from "../entities/requirementsHelperFunctions";
import ScheduleUpload from "./ScheduleUploadModal";
import ActionBar from "./ActionBar";

export const FourYearPlanPage: FC<FourYearPlanType> = memo(
  function FourYearPlanPage({
    PassedCourseList, // The combination of major, concentration, and gen ed
    requirements, // List of requirements for major/concentration
    requirementsGen, // List of requirements for gen-eds
    importData
  }) {
    // this will update if you pull in a saved schedule with more than 8 semesters
    // defaults to 8 for a standard schedule
    const [semestersLength] = useState<number>(8);
    const [semesters, setSemesters] = useState<SemesterType[]>(initializeSemesters());
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
    const [warningPrerequisiteCourses, setWarningPrerequisiteCourses] = useState<CourseType[]>([]);
    const [warningFallvsSpringCourses, setWarningFallvsSpringCourses] = useState<CourseType[]>([]);
    const [warningDuplicateCourses, setWarningDuplicateCourses] = useState<CourseType[]>([]);
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
    const [fourYearPlan] = useState(JSON.parse(userMajor()?.concentration?.fourYearPlan ?? ""));
    // The list of requirements and their completion for display
    const [requirementsDisplay, setRequirementsDisplay] = useState<RequirementComponentType[]>([]);

    // Requirements that are manipulated
    const [reqList, setReqList] = useState<RequirementComponentType[] | null | undefined>(requirements);
    const [reqGenList, setReqGenList] = useState<RequirementComponentType[] | null | undefined>(requirementsGen);

    //  A list of all courses that are in more than one categories, for use with requirements
    const [coursesInMultipleCategories, setCoursesInMultipleCategories] = useState<MultipleCategoriesType[]>([]);

    // Stuff for category dropdown.
    const [categories, setCategories] = useState<string[]>([]); // list of all categories
    const [coursesInCategory, setCoursesInCategory] = useState<CourseType[]>([]); // courses in category that is selected

    // Used to keep track of which information to display in the far right area
    const defaultInformationType = "Requirements (Calculated)"; // The default
    const [informationTypes, setInformationTypes] = useState<string[]>([defaultInformationType]);
    const [displayedInformationType, setDisplayedInformationType] = useState<string | undefined>(defaultInformationType);

    // create 8 semesters for four years of type Fall and Spring
    // used for the empty schedule or load fourYearPlan
    function initializeSemesters(): SemesterType[] {
      const tempSemesters = [];
      let year: number = 0;
      for (let i = 0; i < semestersLength; i++) {
        // increment year every two semesters
        if (i % 2 === 0) {
          year++;
        }
        tempSemesters.push(
          {
            accepts: [ItemTypes.COURSE],
            courses: [],
            semesterNumber: i + 1,
            SemesterCredits: 0,
            Warning: null,
            year,
            season: i % 2 === 0 ? season.Fall : season.Spring
          }
        );
      }
      return tempSemesters;
    }

    useEffect(() => {
      // Whenever completed courses may update, determine
      // whether we need to display it in the dropdown
      const completedCourses = userMajor()?.completed_courses ?? 0;
      if (completedCourses !== 0) {
        console.log("Setting up completed courses", userMajor()?.completed_courses);
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
      PassedCourseList.map((course, index) => {
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
      PassedCourseList.map((course, index) => {
        i.push(course.category);
      });
      // Remove duplicate categories from the array.
      setCategories(RemoveDuplicates(i));
    }

    // Handle a drop into a semester from a semester or the course list
    const handleDrop = useCallback(
      (index: number, item: { idCourse: number; dragSource: string }) => {
        const { idCourse } = item;
        const { dragSource } = item;
        let movedFromIndex = -1;
        let course: CourseType | undefined;
        if (dragSource !== "CourseList") {
          // index of semester it was moved from
          movedFromIndex = +dragSource.split(" ")[1];
          console.log(movedFromIndex);
          course = semesters[movedFromIndex].courses.find(
            (item: any) => item.idCourse === idCourse
          );
        } else {
          // find the course by name in the master list of all courses
          course = PassedCourseList.find((item) => item.idCourse === idCourse);
        }
        if (course !== undefined) {
          //  Get all course subject and acronyms in current semester (excluding the course to be added)
          const currentCourses = new Array<string>();
          semesters[index].courses.forEach((x: CourseType) => {
            currentCourses.push(x.subject + "-" + x.number);
          });

          if (dragSource === "CourseList" && !courseAlreadyInSemester(course, index, semesters)) {
            const newSemesterCount = getSemesterTotalCredits(index) + course.credits;
            const newWarningState = getWarning(newSemesterCount);
            // Add the course to the semester
            course.dragSource = "Semester " + index;
            checkRequirements(course, coursesInMultipleCategories);
            setSemesters(
              update(semesters, {
                [index]: {
                  courses: {
                    $push: [course]
                  },
                  Warning: {
                    $set: newWarningState
                  },
                  SemesterCredits: {
                    $set: newSemesterCount
                  }
                }
              })
            );
          } else {
            // Course was not found in the courses list, which means it currently occupies a semester
            // Only proceed if the course isn't moved to the same semester
            if (!courseAlreadyInSemester(course, index, semesters)) {
              // Update the semester with the new dragged course
              const pushCourse = semesters[index].courses;
              pushCourse.push(course);
              const newSemesterCount2 = getSemesterTotalCredits(index);
              const newWarningState2 = getWarning(newSemesterCount2);
              setSemesters(
                update(semesters, {
                  [index]: {
                    courses: {
                      $push: [course]
                    },
                    Warning: {
                      $set: newWarningState2
                    },
                    SemesterCredits: {
                      $set: newSemesterCount2
                    }
                  }
                })
              );

              const tempSemesters = semesters;
              tempSemesters[index].SemesterCredits = newSemesterCount2;
              tempSemesters[index].Warning = newWarningState2;
              setSemesters(tempSemesters);

              // Then remove the course from its previous semester spot
              const coursesRemove = semesters[movedFromIndex].courses.filter((item: any) => item !== course);
              const removedNewCredits = getSemesterTotalCredits(movedFromIndex) - course.credits;
              const updatedWarning = getWarning(removedNewCredits);
              setSemesters(
                update(semesters, {
                  [movedFromIndex]: {
                    courses: {
                      $set: coursesRemove
                    },
                    SemesterCredits: {
                      $set: removedNewCredits
                    },
                    Warning: {
                      $set: updatedWarning
                    }
                  }
                })
              );
            }
          }
          setUpdateWarning({
            course,
            oldSemester: courseAlreadyInSemester(course, index, semesters) ? movedFromIndex : -1,
            newSemester: index,
            draggedOut: false,
            newCheck: true
          });
        }
      },
      [semesters, coursesInMultipleCategories, reqList, reqGenList, PassedCourseList]
    );

    // handle a drop into the course list from a semester
    const handleReturnDrop = useCallback(
      (item: { idCourse: number; dragSource: string }) => {
        const { idCourse } = item;
        const { dragSource } = item;
        // ignore all drops from the course list
        if (dragSource !== "CourseList") {
          // get the semester index from the drag source
          const movedFromIndex = +dragSource.split(" ")[1];
          const found = semesters[movedFromIndex].courses.find((item: any) => item.idCourse === idCourse);
          if (found !== undefined) {
            // set the drag source to course list (may be redundant but I'm scared to mess with it)
            found.dragSource = "CourseList";

            //  Update semesters to have the course removed
            const itemArr = semesters[movedFromIndex].courses.filter((course: any) => course !== found);
            const newSemesterCount = getSemesterTotalCredits(movedFromIndex) - found.credits;
            const updatedWarning = getWarning(newSemesterCount);
            setSemesters(
              update(semesters, {
                [movedFromIndex]: {
                  courses: {
                    $set: itemArr
                  },
                  SemesterCredits: {
                    $set: newSemesterCount
                  },
                  Warning: {
                    $set: updatedWarning
                  }
                }
              })
            );
            let noRemove = false;
            let count = 0;
            semesters.forEach((x) =>
              x.courses.forEach((y: any) => {
                if (y.idCourse === found.idCourse) {
                  count++;
                }
              })
            );
            if (count > 1 && !found.repeatableForCred) {
              noRemove = true;
            }
            userMajor()?.completed_courses.forEach((x) => {
              const subject = x.split("-")[0];
              const number = x.split("-")[1];
              if (subject === found.subject && number === found.number) {
                noRemove = true;
              }
            });
            if (!noRemove) {
              removeFromRequirements(found);
            }

            setUpdateWarning({
              course: found,
              oldSemester: movedFromIndex,
              newSemester: -1,
              draggedOut: true,
              newCheck: true
            });
          }
        }
      },
      [PassedCourseList, semesters]
    );

    //  This function checks if the course that was moved is in a "valid" fall or spring semester
    function checkCourseSemester(course: CourseType, semNum: number): boolean {
      return ((course.semesters === "FA" && semNum % 2 === 1) || (course.semesters === "SP" && semNum % 2 === 0));
    }

    //  This useEffect is in charge of checking for duplicate courses
    useEffect(() => {
      if (updateWarning.newCheck) {
        let duplicateFound = false;
        //  Compare each course to courses in future semesters to see if there are any duplicates
        semesters.forEach((semester, index) => {
          semester.courses.forEach((course: CourseType) => {
            //  If the course is found in future semesters, then it has a duplicate
            if (updateWarning.course === course && updateWarning.newSemester !== index && updateWarning.newSemester !== -1) {
              if (!course.repeatableForCred) {
                //  Show the warning
                setVisibility(true);
                throwError("WARNING! " + course.subject + "-" + course.number + " is already in other semesters.", "warning");

                //  Append the course to the duplicate warning courses list
                const temp = warningDuplicateCourses;
                temp.push(course);
                setWarningDuplicateCourses(temp);
                duplicateFound = true;
              }
            }
          });
        });
        //  If there was not a duplicate course found
        if (!duplicateFound) {
          //  Remove the course from the duplicates warning list
          const temp = new Array<CourseType>();
          warningDuplicateCourses.forEach((x) => {
            if (x !== updateWarning.course) {
              temp.push(x);
            }
          });
          setWarningDuplicateCourses(temp);
        }
      }
      // Reset the warning
      setUpdateWarning({
        course: undefined,
        oldSemester: -1,
        newSemester: -1,
        draggedOut: true,
        newCheck: false
      });
    }, [semesters]);

    //  This useEffect handles fall vs spring course placement
    useEffect(() => {
      if (updateWarning.newCheck && updateWarning.course !== undefined) {
        //  Check if the course is offered in the semester it was dragged to
        if (checkCourseSemester(updateWarning.course, updateWarning.newSemester)) {
          //  If the course is not offered during the semester, add it to the warning course list
          if (warningFallvsSpringCourses.find((x) => x === updateWarning.course) === undefined) {
            warningFallvsSpringCourses.push(updateWarning.course);
            setVisibility(true);
            throwError("WARNING! " + updateWarning.course.subject + "-" + updateWarning.course.number +
            " is not typically offered during the " + (updateWarning.newSemester % 2 === 0 ? "Fall" : "Spring") + " semester", "warning");
          }
        } else {
          //  Otherwise remove it from the warning course list
          const temp = new Array<CourseType>();
          const removeCourse = warningFallvsSpringCourses.find((x) => x === updateWarning.course);
          warningFallvsSpringCourses.forEach((x) => {
            if (x !== removeCourse) {
              temp.push(x);
            }
          });
          setWarningFallvsSpringCourses(temp);
        }
      }
      // Reset the warning
      setUpdateWarning({
        course: undefined,
        oldSemester: -1,
        newSemester: -1,
        draggedOut: true,
        newCheck: false
      });
    }, [semesters]);

    //  This useEffect is in charge of checking prerequisites
    useEffect(() => {
      if (updateWarning.newCheck && updateWarning.course !== undefined) {
        //  This will store if the prerequisites for the changed course have been satisfied
        let satisfied;
        //  If the course is not dragged out, check its prerequisites
        if (!updateWarning.draggedOut) {
          //  Get all courses in current semester and previous semesters
          const currCourses = new Array<string>();
          const pastCourses = new Array<string>();
          semesters.forEach((x, index) => {
            if (index < updateWarning.newSemester) {
              x.courses.forEach((y: any) => {
                pastCourses.push(y.subject + "-" + y.number);
              });
            }
            if (index === updateWarning.newSemester) {
              x.courses.forEach((y: any) => {
                currCourses.push(y.subject + "-" + y.number);
              });
            }
          });

          //  Append the already taken courses
          userMajor()?.completed_courses.forEach((x) => {
            pastCourses.push(x);
          });

          //  Find if the course has met its prerequisites
          const stringProcess = new StringProcessing();
          satisfied = stringProcess.courseInListCheck(
            updateWarning.course.preReq,
            pastCourses,
            currCourses
          );
          //  If the prereq for that moved course is not satisfied, have that course throw the error
          if (!satisfied.returnValue) {
            setVisibility(true);
            throwError("WARNING! " + updateWarning.course.subject + "-" + updateWarning.course.number +
              " has failed the following prerequisites: " + satisfied.failedString, "error");
            //  Update the warning courses to include the just dragged course
            const temp = warningPrerequisiteCourses;
            temp.push(updateWarning.course);
            setWarningPrerequisiteCourses(temp);
          }
        }

        //  If the course has been dragged from earlier to later
        if (updateWarning.oldSemester < updateWarning.newSemester && satisfied !== undefined) {
          //  Check all semesters past the old moved semester
          const response = preReqCheckAllCoursesPastSemester(
            updateWarning.course,
            updateWarning.oldSemester,
            updateWarning.oldSemester === -1 ? false : satisfied.returnValue,
            true,
            false,
            semesters,
            warningPrerequisiteCourses
          );
          if (response.vis) {
            setVisibility(response.vis);
            throwError(response.error, "error");
          }
          setWarningPrerequisiteCourses(response.warning);
        }
        //  Check all semesters past the new moved semester
        const response = preReqCheckAllCoursesPastSemester(
          updateWarning.course,
          updateWarning.newSemester,
          true,
          false,
          updateWarning.draggedOut,
          semesters,
          warningPrerequisiteCourses
        );
        if (response.vis) {
          setVisibility(response.vis);
          throwError(response.error, "error");
        }
        setWarningPrerequisiteCourses(response.warning);
      }
      // Reset the warning
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
    const getWarning = (SemesterCredits: number): warning | null => {
      let Warning = null;
      if (SemesterCredits <= 11 && SemesterCredits > 0) {
        Warning = warning.Low;
      } else if (SemesterCredits >= 19) {
        Warning = warning.High;
      }
      return Warning;
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
      if (requirements === undefined || requirements === null || requirementsGen === undefined || requirementsGen === null) { return; }
      if (ran) { return; };
      const response = processRequirementLists(requirements, requirementsGen);
      setReqList(response.req);
      setReqGenList(response.reqGen);
      setRequirementsDisplay(response.display);
      setRan(true);
    }, [requirements, requirementsGen, PassedCourseList]);

    // This use effect creates a list of all courses that can fill more than one requirement
    useEffect(() => {
      // get the courses with more than one category they can satisfy
      setCoursesInMultipleCategories(createMultipleCategoryList(PassedCourseList));
    }, [PassedCourseList]);

    // This prevents the data from resetting when you click off the page
    const [alreadySetThisData, setAlreadySetThisData] = useState(false);
    // fill in the schedule and check requirements on import or four year plan
    useEffect(() => {
      if (coursesInMultipleCategories.length !== 0 && reqList != null && reqGenList != null && !alreadySetThisData) {
        userMajor()?.completed_courses.forEach((x) => {
          const a = x.split("-");
          const found = PassedCourseList.find((item) => item.subject === a[0] && item.number === a[1]);
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
            const courseStringArr = fourYearPlan.ClassPlan["Semester" + (index + 1)].Courses;
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
            const newWarningState = getWarning(credits);
            semester.Warning = newWarningState;
          });
        }
        // check now that we have multiple category data
        // if (importData !== undefined) {
        //   // fill in the schedule
        //   semesters.forEach((semester) => {
        //     const tempArr: CourseType[] = [];
        //     // Get the semester data from the json
        //     const courseStringArr =
        //       importData.ClassPlan["Semester" + semester.semesterNumber];
        //     let credits = 0;
        //     // loop through each course in the list
        //     courseStringArr?.forEach((courseString: any) => {
        //       const subject = courseString.split("-")[0];
        //       const number = courseString.split("-")[1];
        //       let course;
        //       // This variable prevents the course being added twice if it is in
        //       // more than one category
        //       let foundOnce = false;
        //       // Find the course in the master list of courses
        //       PassedCourseList.forEach((x) => {
        //         if (
        //           x.subject === subject &&
        //           x.number === number &&
        //           userMajor()?.completed_courses.find(
        //             (y) => y === x.subject + "-" + x.number
        //           ) === null
        //         ) {
        //           if (!foundOnce) {
        //             // define the course and update it as needed
        //             course = x;
        //             course.dragSource = "Semester" + semester.semesterNumber;
        //             checkRequirements(course, coursesInMultipleCategories);
        //             foundOnce = true;
        //           }
        //         }
        //       });
        //       // If there is a course add it to the temporary array for the semester
        //       if (course !== undefined) {
        //         tempArr.push(course);
        //         credits += course.credits;
        //       }
        //     });
        //     // update the necessary semester values
        //     semester.courses = tempArr;
        //     semester.SemesterCredits = credits;
        //     const newWarningState = getWarning(credits);
        //     semester.Warning = newWarningState;
        //   });
        // }
        setAlreadySetThisData(true);
      }
    }, [coursesInMultipleCategories]);

    // called when a course is removed from the schedule to remove it from reqs
    const removeFromRequirements = useCallback(
      (course: CourseType) => {
        const reqCheck = new RequirementsProcessing();
        const updatedRequirements = reqCheck.removeCourseFromRequirements(course, reqGenList, reqList);
        setReqGenList(updatedRequirements.gen);
        setReqList(updatedRequirements.major);
      },
      [reqList, reqGenList, requirements, requirementsGen]
    );

    // called when a course is added to the schedule to add it to reqs
    const checkRequirements = useCallback(
      (course: CourseType, multipleCategories: any) => {
        if (reqList !== null && reqList !== undefined && reqGenList !== null && reqGenList !== undefined) {
          const reqCheck = new RequirementsProcessing();
          // check for any major/concentration reqs it can fill
          const Major = reqCheck.majorReqCheck(course, reqList);
          setReqList(Major.reqList);
          if (!Major.addedCourse) {
            // check if it fills any unfilled gen-ed requirements
            setReqGenList(reqCheck.checkRequirementsGen(
              course,
              multipleCategories,
              reqGenList,
              PassedCourseList
            ));
          }
        }
      },
      [reqList, reqGenList, requirementsDisplay, PassedCourseList]
    );

    return (
      <div>
        <div className="drag-drop">
        <ActionBar
              scheduleData={info}
            />
          <div style={{ overflow: "hidden", clear: "both" }}>
          <Snackbar
        open={visibility}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {`${error}`}
        </Alert>
      </Snackbar>
            {semesters.map(
              (
                {
                  accepts,
                  courses,
                  SemesterCredits,
                  Warning,
                  year,
                  season
                },
                index
              ) => (
                <Semester
                  accept={accepts}
                  onDrop={(item) => handleDrop(index, item)}
                  semesterNumber={index + 1}
                  courses={courses}
                  key={index}
                  SemesterCredits={SemesterCredits}
                  Warning={Warning}
                  warningPrerequisiteCourses={warningPrerequisiteCourses}
                  warningFallvsSpringCourses={warningFallvsSpringCourses}
                  warningDuplicateCourses={warningDuplicateCourses}
                  year={year}
                  season={season}
                />
              )
            )}
          </div>
          <div
            style={{ overflow: "hidden", clear: "both" }}
            className="class-dropdown"
          >
            <div>
              <div
                onClick={() => extractCategories()}
                className="course-box-header"
              >
                <SearchableDropdown
                  options={categories.map((c) => ({
                    label: c,
                    value: c
                  }))}
                  label={null}
                  onSelectOption={selectedCategory} // If option chosen, selected Category activated.
                />
              </div>
            </div>
            <CourseList
              accept={[ItemTypes.COURSE]}
              onDrop={(item) => handleReturnDrop(item)}
              courses={coursesInCategory}
              key={0}
            />
          </div>
          <div className="right-information-box">
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
                  { Object.keys(fourYearPlan.ClassPlan).map((key, index) => {
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
                  {userMajor()?.completed_courses?.map((completedCourse, index) => {
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
