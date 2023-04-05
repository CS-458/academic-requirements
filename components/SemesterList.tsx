import {
  Accordion as MuiAccordion,
  AccordionDetails,
  AccordionProps,
  AccordionSummary as MuiAccordionSummary,
  AccordionSummaryProps,
  styled
} from "@mui/material";
import { ArrowForwardIosSharp } from "@mui/icons-material";
import { useCallback, useState } from "react";
import {
  CourseType,
  MultipleCategoriesType,
  RequirementComponentType,
  SemesterType,
  sortSemester,
  warning
} from "../entities/four_year_plan";
import { Semester } from "./Semester";
import { useDrop } from "react-dnd";
import { ItemTypes } from "../entities/Constants";
import { CourseError } from "./FourYearPlanPage";
import DropTargetAccordian from "./DropAccordian";

/// Modified MUI accordion
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

/// Modified MUI Summary
const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharp sx={{ fontSize: "0.9rem" }} />}
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
  reqGenList
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
}): JSX.Element {
  const handleDrop = useCallback(
    (semNumber: number, item: { idCourse: number; dragSource: string }) => {
      const { idCourse, dragSource } = item;
      console.log("Drop", semNumber, idCourse, dragSource);
      const tmpSemesters = deepCopy(semesters);

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
