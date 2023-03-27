import {
  Accordion as MuiAccordion,
  AccordionDetails,
  AccordionProps,
  AccordionSummary as MuiAccordionSummary,
  AccordionSummaryProps,
  styled
} from "@mui/material";
import { ArrowForwardIosSharp } from "@mui/icons-material";
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
import { isCaseOrDefaultClause } from "typescript";

/// Modified MUI accordian
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

function deepCopy(s: SemesterType[]): SemesterType[] {
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
  warningPrerequisiteCourses: CourseType[];
  warningFallvsSpringCourses: CourseType[];
  warningDuplicateCourses: CourseType[];
  PassedCourseList: CourseType[];
  setSemesters: (s: SemesterType[]) => void;
  checkRequirements: (a: CourseType, b: MultipleCategoriesType[]) => any;
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
        source.SemesterCredits = source.courses.reduce(
          (a, b) => a + b.credits,
          0
        );
        source.Warning = getWarning(source.SemesterCredits);
      }
      checkRequirements(course, coursesInMultipleCategories);
      course.dragSource = `Semester ${semNumber}`;
      target.courses.push(course);
      target.SemesterCredits = target.courses.reduce(
        (a, b) => a + b.credits,
        0
      );
      target.Warning = getWarning(target.SemesterCredits);
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
  const expandedArr: Array<(v: boolean) => void> = [];
  // Build semester lists
  for (let i = 0; i < 4; i++) {
    const [expanded, setExpanded] = useState(i === 0);
    expandedArr.push(setExpanded);
    const [props, drop] = useDrop({
      accept: [ItemTypes.COURSE],
      drop: () => { },
      collect: (monitor) => {
        if (monitor.isOver({ shallow: true }) && !expanded) {
          setExpanded(true);
          // expandedArr.forEach((v, index) => v(index === i));
        }
      }
    });
    parts.push(
      <Accordion expanded={expanded} onChange={(_, e) => setExpanded(e)}>
        <div ref={drop}>
          <AccordionSummary sx={{ bgcolor: "primary.main" }}>
            Year {i + 1}
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
                  key={index}
                  accept={sem.accepts}
                  onDrop={(item) => handleDrop(sem.semesterNumber, item)}
                  semesterNumber={sem.semesterNumber}
                  courses={sem.courses}
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
  );
}
