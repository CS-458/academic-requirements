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

  const getSuggestedContent = (semNum: number): {
    courses: CourseType[];
    requirements: String[];
  } => {
    const fourYearPlan = JSON.parse(userMajor()?.concentration?.fourYearPlan ?? "{}");
    const classPlan = fourYearPlan.ClassPlan["Semester" + (semNum + 1)];

    // get all course objects given subject-number in classPlan.Courses
    const suggestedCourses: CourseType[] = [];
    classPlan?.Courses.forEach((courseString: String) => {
      const subject = courseString.split("-")[0];
      const number = courseString.split("-")[1];
      PassedCourseList.forEach((course: CourseType) => {
        if (course.subject === subject && course.number === number) {
          // Course is not in the suggestions already
          if (suggestedCourses.findIndex(sc => sc.idCourse === course.idCourse) === -1) {
            suggestedCourses.push(course);
          }
        }
      });
    });

    // remove a suggestion if it already exists in the schedule
    props.semesters.forEach((sem) => {
      sem.courses.forEach((semCourse) => {
        const foundIndex = suggestedCourses.findIndex((suggestedCourse) => {
          return suggestedCourse.idCourse === semCourse.idCourse;
        });
        if (foundIndex !== -1) {
          // Course is already on the schedule, remove it
          suggestedCourses.splice(foundIndex, 1);
        }
      });
    });
    return {
      courses: suggestedCourses,
      requirements: classPlan !== undefined ? classPlan.Requirements : []
    };
  };

  return (
    <Accordion expanded={expanded} onChange={(_, e) => setExpanded(e)}>
      <div ref={drop}>
        <AccordionSummary sx={{ bgcolor: "primary.main" }}>
          Year {props.year + 1}
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
