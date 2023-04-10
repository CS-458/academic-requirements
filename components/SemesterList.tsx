import { useCallback } from "react";
import {
  CourseType,
  MultipleCategoriesType,
  RequirementComponentType,
  SemesterType
} from "../entities/four_year_plan";
import { CourseError } from "./FourYearPlanPage";
import DropTargetAccordian from "./DropAccordian";

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
  createCourseMoveRecord
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
}): JSX.Element {
  const handleDrop = useCallback(
    (semNumber: number, item: { idCourse: number; dragSource: string }) => {
      const { idCourse, dragSource } = item;
      console.log("Drop", semNumber, idCourse, dragSource);
      const tmpSemesters = deepCopy(semesters);
      const movedFrom = dragSource === undefined || dragSource === "CourseList" ? -2 : parseInt(dragSource.split(" ")[1]);
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

  return (
    <div className="generic" style={{ overflowY: "auto", height: "100%" }}>
      {parts}
    </div>
  );
}
