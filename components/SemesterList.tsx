import {
  Accordion as MuiAccordion,
  AccordionDetails,
  AccordionProps,
  AccordionSummary as MuiAccordionSummary,
  AccordionSummaryProps,
  Divider,
  Stack,
  styled
} from "@mui/material";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import update from "immutability-helper";
import { useCallback, useState } from "react";
import {
  CourseType,
  MultipleCategoriesType,
  RequirementComponentType,
  SemesterType,
  sortSemester,
  warning
} from "../entities/four_year_plan";
import { courseAlreadyInSemester } from "../entities/prereqHelperFunctions";
import { Semester } from "./Semester";
import { useDrop } from "react-dnd";
import { ItemTypes } from "../entities/Constants";

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0
  },
  "&:before": {
    display: "none"
  }
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, .05)"
      : "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)"
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1)
  }
}));

export default function SemesterList({
  semesters,
  warningPrerequisiteCourses,
  warningFallvsSpringCourses,
  warningDuplicateCourses,
  PassedCourseList,
  setSemesters,
  checkRequirements,
  coursesInMultipleCategories,
  setUpdateWarning,
  reqList,
  reqGenList
}: {
  semesters: SemesterType[];
  warningPrerequisiteCourses: CourseType[];
  warningFallvsSpringCourses: CourseType[];
  warningDuplicateCourses: CourseType[];
  PassedCourseList: CourseType[];
  // TODO
  setSemesters: (s: SemesterType[]) => void;
  checkRequirements: (a: any, b: any) => any;
  coursesInMultipleCategories: MultipleCategoriesType[];
  setUpdateWarning: (a: any) => any;
  reqList: RequirementComponentType[];
  reqGenList: RequirementComponentType[];
}): JSX.Element {
  //  This function sets the correct warning for the semester
  const getWarning = (SemesterCredits: number): warning | null => {
    if (SemesterCredits <= 11 && SemesterCredits > 0) {
      return warning.Low;
    } else if (SemesterCredits >= 19) {
      return warning.High;
    } else {
      return null;
    }
  };

  //  A Function that grabs the total credits for the semester
  const getSemesterTotalCredits = (semesterIndex: number): number => {
    return semesters[semesterIndex].courses.reduce(
      (total, x) => total + x.credits,
      0
    );
  };

  const handleDrop = useCallback(
    (semNumber: number, item: { idCourse: number; dragSource: string }) => {
      const index = semesters.findIndex(
        (sem) => sem.semesterNumber === semNumber
      );
      if (index == null) return;
      const { idCourse } = item;
      const { dragSource } = item;
      console.log("id", idCourse);
      let movedFromIndex = -1;
      let course: CourseType | undefined;
      if (dragSource !== "CourseList") {
        // index of semester it was moved from
        movedFromIndex = +dragSource.split(" ")[1];
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

        if (
          dragSource === "CourseList" &&
          !courseAlreadyInSemester(course, index, semesters)
        ) {
          const newSemesterCount =
            getSemesterTotalCredits(index) + course.credits;
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
            const coursesRemove = semesters[movedFromIndex].courses.filter(
              (item: any) => item !== course
            );
            const removedNewCredits =
              getSemesterTotalCredits(movedFromIndex) - course.credits;
            const updatedWarning = getWarning(removedNewCredits);
            setSemesters(
              update(semesters, {
                [index]: {
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
        console.log("setting");
        setUpdateWarning({
          course,
          oldSemester: courseAlreadyInSemester(course, index, semesters)
            ? movedFromIndex
            : -1,
          newSemester: index,
          draggedOut: false,
          newCheck: true
        });
      }
    },
    [
      semesters,
      coursesInMultipleCategories,
      reqList,
      reqGenList,
      PassedCourseList
    ]
  );

  const parts = [];
  const expandedArr: Array<(v: boolean) => void> = [];
  for (let i = 0; i < 4; i++) {
    const [expanded, setExpanded] = useState(i === 0);
    expandedArr.push(setExpanded);
    const [props, drop] = useDrop({
      accept: [ItemTypes.COURSE],
      drop: () => { },
      collect: (monitor) => {
        if (monitor.isOver({ shallow: true })) {
          expandedArr.forEach((v, index) => v(index === i));
        }
      }
    });
    parts.push(
      <Accordion expanded={expanded} onChange={(_, e) => setExpanded(e)}>
        <div ref={drop}>
          <AccordionSummary
            sx={{ bgcolor: "primary.main" }}
            expandIcon={
              <ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />
            }
          >
            Year {i}
          </AccordionSummary>
        </div>
        <AccordionDetails sx={{ p: 0 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "100%"
            }}
          >
            {semesters
              .filter((sem) => sem.year === i + 1)
              .sort(sortSemester)
              .map((sem, index) => (
                <Semester
                  accept={sem.accepts}
                  onDrop={(item) => handleDrop(sem.semesterNumber, item)}
                  semesterNumber={sem.semesterNumber}
                  courses={sem.courses}
                  key={index}
                  SemesterCredits={sem.SemesterCredits}
                  Warning={sem.Warning}
                  warningPrerequisiteCourses={warningPrerequisiteCourses}
                  warningFallvsSpringCourses={warningFallvsSpringCourses}
                  warningDuplicateCourses={warningDuplicateCourses}
                  year={sem.year}
                  season={sem.season}
                />
              ))}
          </div>
        </AccordionDetails>
      </Accordion>
    );
  }

  return (
    <div
      className="generic"
      style={{ overflow: "scroll auto", height: "100%" }}
    >
      {parts}
    </div>
    // <>
    //   <div style={{ overflow: "hidden", clear: "both" }}>
    //     {semesters.map(
    //       (
    //         {
    //           accepts,
    //           semesterNumber,
    //           courses,
    //           SemesterCredits,
    //           Warning,
    //           year,
    //           season
    //         },
    //         index
    //       ) => (
    //         <Semester
    //           accept={accepts}
    //           onDrop={(item) => handleDrop(index, item)}
    //           semesterNumber={semesterNumber}
    //           courses={courses}
    //           key={index}
    //           SemesterCredits={SemesterCredits}
    //           Warning={Warning}
    //           warningPrerequisiteCourses={warningPrerequisiteCourses}
    //           warningFallvsSpringCourses={warningFallvsSpringCourses}
    //           warningDuplicateCourses={warningDuplicateCourses}
    //           year={year}
    //           season={season}
    //         />
    //       )
    //     )}
    //   </div>
    // </>
  );
}
