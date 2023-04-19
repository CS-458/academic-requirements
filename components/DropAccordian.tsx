import {
  Accordion as MuiAccordion,
  AccordionDetails,
  AccordionProps,
  AccordionSummary as MuiAccordionSummary,
  AccordionSummaryProps,
  styled
} from "@mui/material";
import { ArrowForwardIosSharp } from "@mui/icons-material";
import { useContext, useState } from "react";
import {
  CourseType,
  SemesterType,
  season,
  sortSemester
} from "../entities/four_year_plan";
import { Semester } from "./Semester";
import { useDrop } from "react-dnd";
import { ItemTypes } from "../entities/Constants";
import { CourseError, PassedCourseListContext } from "./FourYearPlanPage";
import { userMajor } from "../services/user";

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
    expandIcon={
      <ArrowForwardIosSharp
        sx={{ fontSize: "0.9rem" }}
        data-testid="expand-year"
      />
    }
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

export default function DropTargetAccordian(props: {
  defaultExpanded?: boolean;
  semesters: SemesterType[];
  year: number;
  handleDrop: (s: number, i: any) => void;
  warningPrerequisiteCourses: CourseError[];
  warningFallvsSpringCourses: CourseError[];
  warningDuplicateCourses: CourseError[];
}): JSX.Element {
  const [expanded, setExpanded] = useState(props.defaultExpanded === true);
  const [_props, drop] = useDrop({
    accept: [ItemTypes.COURSE],
    drop: () => { },
    collect: (monitor) => {
      if (monitor.isOver({ shallow: true }) && !expanded) {
        setExpanded(true);
        // expandedArr.forEach((v, index) => v(index === i));
      }
    }
  });

  const PassedCourseList = useContext(PassedCourseListContext);

  const getSuggestedContent = (
    semNum: number
  ): {
    courses: CourseType[];
    requirements: String[];
  } => {
    const fourYearPlan = JSON.parse(
      userMajor()?.concentration?.fourYearPlan ?? "null"
    );
    const classPlan =
      semNum % 2 === 0
        ? fourYearPlan?.ClassPlan["Semester" + (semNum / 2 + 1)]
        : undefined;
    const completedCourses = userMajor()?.completed_courses ?? [];
    const curSemester = props.semesters.find(
      (sem) => sem.semesterNumber === semNum
    );
    const suggestedCourses: CourseType[] = [];

    PassedCourseList.forEach((course: CourseType) => {
      // Suggest courses based on the four year plan
      classPlan?.Courses.forEach((courseString: String) => {
        const subject = courseString.split("-")[0];
        const number = courseString.split("-")[1];

        // We found the full course object for a course in the four year plan
        if (course.subject === subject && course.number === number) {
          // Course is not already marked as complete
          if (completedCourses.findIndex((cc) => cc === courseString) === -1) {
            // Course is not already suggested (or is repeatable and can be suggested again)
            if (
              course.repeatableForCred ||
              suggestedCourses.findIndex(
                (sc) => sc.idCourse === course.idCourse
              ) === -1
            ) {
              suggestedCourses.push(course);
            }
          } else {
            // Only suggest a completed course if it's repeatable
            if (course.repeatableForCred) {
              suggestedCourses.push(course);
            }
          }
        }
      });

      // Suggest all courses that are available in Winter/Summer for a winter/summer semester
      if (
        (curSemester?.season === season.Winter &&
          course.semesters?.includes("WI")) ||
        (curSemester?.season === season.Summer &&
          course.semesters?.includes("SU"))
      ) {
        if (
          suggestedCourses.findIndex(
            (sc) => sc.idCourse === course.idCourse
          ) === -1
        ) {
          suggestedCourses.push(course);
        }
      }
    });

    // remove a suggestion if it already exists in the schedule
    props.semesters.forEach((sem) => {
      sem.courses.forEach((semCourse) => {
        // We found the suggested course in the schedule
        const foundIndex = suggestedCourses.findIndex((suggestedCourse) => {
          return suggestedCourse.idCourse === semCourse.idCourse;
        });
        if (foundIndex !== -1) {
          // Handle repeatable courses differently
          if (semCourse.repeatableForCred) {
            // Only remove a repeatable course if we are looking in the current semester
            if (sem.semesterNumber === curSemester?.semesterNumber) {
              suggestedCourses.splice(foundIndex, 1);
            }
          } else {
            // Non-repeatable courses
            suggestedCourses.splice(foundIndex, 1);
          }
        }
      });
    });

    return {
      courses: suggestedCourses,
      requirements: classPlan !== undefined ? classPlan.Requirements : []
    };
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, e) => setExpanded(e)}
      sx={{ pageBreakInside: "avoid" }}
    >
      <div ref={drop}>
        <AccordionSummary sx={{ bgcolor: "primary.main" }}>
          Year {props.year + 1}
        </AccordionSummary>
      </div>
      <AccordionDetails sx={{ p: 0, pageBreakInside: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "100%"
          }}
        >
          {props.semesters
            .filter((sem) => sem.year === props.year + 1)
            .sort(sortSemester)
            .map((sem, index) => (
              <Semester
                key={index}
                accept={sem.accepts}
                onDrop={(item) => props.handleDrop(sem.semesterNumber, item)}
                semesterNumber={sem.semesterNumber}
                courses={sem.courses}
                SemesterCredits={sem.SemesterCredits}
                Warning={sem.Warning}
                warningPrerequisiteCourses={props.warningPrerequisiteCourses}
                warningFallvsSpringCourses={props.warningFallvsSpringCourses}
                warningDuplicateCourses={props.warningDuplicateCourses}
                year={sem.year}
                season={sem.season}
                suggestedContent={getSuggestedContent(sem.semesterNumber)}
              />
            ))}
        </div>
      </AccordionDetails>
    </Accordion>
  );
}
