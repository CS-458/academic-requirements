import { useCallback } from "react";
import {
  CourseType,
  MultipleCategoriesType,
  RequirementComponentType,
  SemesterType,
  season
} from "../entities/four_year_plan";
import { CourseError } from "./FourYearPlanPage";
import DropTargetAccordian from "./DropAccordian";
import { Button, Stack } from "@mui/material";
import { ItemTypes } from "../entities/Constants";

export function deepCopy(s: SemesterType[]): SemesterType[] {
  const ret: SemesterType[] = [];
  s.forEach((s) => {
    ret.push({
      SemesterCredits: s.SemesterCredits,
      Warning: s.Warning,
      courses: s.courses.map((c) => c),
      semesterNumber: s.semesterNumber,
      accepts: s.accepts,
      season: s.season,
      year: s.year
    });
  });
  return ret;
}

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
  reqGenList,
  createCourseMoveRecord,
  error
}: {
  semesters: SemesterType[];
  warningPrerequisiteCourses: CourseError[];
  warningFallvsSpringCourses: CourseError[];
  warningDuplicateCourses: CourseError[];
  PassedCourseList: CourseType[];
  setSemesters: (s: SemesterType[]) => void;
  checkRequirements: (a: CourseType, b: MultipleCategoriesType[]) => any;
  coursesInMultipleCategories: MultipleCategoriesType[];
  setUpdateWarning: (a: any) => any;
  reqList: RequirementComponentType[];
  reqGenList: RequirementComponentType[];
  createCourseMoveRecord: (a: number, b: number, c: number) => any;
  error: (m: string, s: string) => void;
}): JSX.Element {
  const handleDrop = useCallback(
    (semNumber: number, item: { idCourse: number; dragSource: string }) => {
      const { idCourse, dragSource } = item;
      console.log("Drop", semNumber, idCourse, dragSource);
      const tmpSemesters = deepCopy(semesters);
      const movedFrom =
        dragSource === undefined || dragSource === "CourseList"
          ? -2
          : parseInt(dragSource.split(" ")[1]);
      if (semNumber !== movedFrom) {
        createCourseMoveRecord(semNumber, idCourse, movedFrom);
      }
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
        source.courses = source.courses.filter((c) => c.idCourse !== idCourse);
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
  const parts = [];
  // Build semester lists
  for (let i = 0; i < semesters.reduce((y, s) => Math.max(y, s.year), 0); i++) {
    parts.push(
      <DropTargetAccordian
        key={i}
        defaultExpanded={i === 0}
        semesters={semesters}
        year={i}
        handleDrop={handleDrop}
        warningPrerequisiteCourses={warningPrerequisiteCourses}
        warningFallvsSpringCourses={warningFallvsSpringCourses}
        warningDuplicateCourses={warningDuplicateCourses}
      />
    );
  }

  // adds a year to the FYPP
  function addYear(): void {
    // copies the current schedule
    const tmpSem = deepCopy(semesters);
    // increases the year by 1
    const year = tmpSem.reduce((max, s) => Math.max(max, s.year), 0) + 1;
    // gets the current number of semesters
    let num = tmpSem.reduce((max, s) => Math.max(max, s.semesterNumber), 0);
    // increments the year and semesters to the schedule
    Object.values(season).forEach((s) => {
      num += 1;
      tmpSem.push({
        accepts: [ItemTypes.COURSE],
        courses: [],
        season: s,
        SemesterCredits: 0,
        semesterNumber: num,
        Warning: null,
        year
      });
    });
    // sets the semester to have the added year and semester
    setSemesters(tmpSem);
  }

  // removes a year from the FYPP
  function removeYear(): void {
    // copies the current schedule
    const tmpSem = deepCopy(semesters);
    // gets the last year of the schedule
    const year = tmpSem.reduce((max, s) => Math.max(max, s.year), 0);
    // if the last year has no courses in the semesters
    // then remove
    if (!tmpSem.some((c) => c.year === year && c.courses.length > 0)) {
      const year = tmpSem.reduce((max, s) => Math.max(max, s.year), 0);
      setSemesters(tmpSem.filter((s) => s.year < year));
    // else throw error warning user about having courses in the removing year
    } else {
      error("Cannot remove a year that contains courses!", "warning");
    }
  }

  return (
    <div className="generic" style={{ overflowY: "auto", height: "100%" }}>
      {parts}
      <Stack direction="row" justifyContent="space-around">
        <Button
          onClick={() => { addYear(); }}
          data-testid="addButton"
        >
          Add Year
        </Button>
        <Button
          onClick={() => { removeYear(); }}
          disabled={semesters.length <= 4}
          data-testid="removeButton"
        >
          Remove Year
        </Button>
      </Stack>
    </div>
  );
}
