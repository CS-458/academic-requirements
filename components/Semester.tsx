import React, { FC } from "react";
import { useDrop } from "react-dnd";
// @ts-expect-error
import { Course } from "./DraggableCourse.tsx";
import { ItemTypes } from "../entities/Constants";
import { SemesterProps } from "../entities/four_year_plan";
import { Box, Tooltip } from "@mui/material";
import { WarningAmber } from "@mui/icons-material/";

export const Semester: FC<SemesterProps> = function Semester({
  accept,
  onDrop,
  semesterNumber,
  courses,
  SemesterCredits,
  warningPrerequisiteCourses,
  warningFallvsSpringCourses,
  warningDuplicateCourses,
  Warning,
  year,
  season
}) {
  // defines the drop action
  const [{ isOver }, drop] = useDrop({
    accept,
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  // Changes the background color when you're hovering over the semester
  let bgcolor = "";
  if (Warning !== null) {
    bgcolor = "null";
  };
  if (isOver) bgcolor = "success.main";

  return (
    <Box
      ref={drop}
      className="semester Semester-root"
      sx={{ bgcolor, minHeight: "7em" }}
      data-testid={`semester${semesterNumber}`}
      key={`semester-${year}-${season}`}
    >
      <p>
        {season} ({SemesterCredits}) {Warning !== null ? <Tooltip title={Warning}><WarningAmber data-testid="amber"/></Tooltip> : ""}
      </p>
      {courses.map((course) => (
        <Course
          key={course.idCourse}
          name={course.name}
          subject={course.subject}
          number={course.number}
          idCourse={course.idCourse}
          semesters={course.semesters}
          type={ItemTypes.COURSE}
          credits={course.credits}
          preReq={course.preReq}
          dragSource={`Semester ${semesterNumber}`}
          warningYellowColor={warningDuplicateCourses.find(
            (x) => x.id === course.idCourse && x.sem === semesterNumber
          )}
          warningOrangeColor={warningFallvsSpringCourses.find(
            (x) => x.id === course.idCourse && x.sem === semesterNumber
          )}
          warningRedColor={warningPrerequisiteCourses.find(
            (x) => x.id === course.idCourse && x.sem === semesterNumber
          )}
          repeatableForCred={course.repeatableForCred}
        />
      ))}
    </Box>
  );
};
