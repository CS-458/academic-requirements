import React, { CSSProperties, FC } from "react";
import { useDrop } from "react-dnd";
// @ts-expect-error
import { Course } from "./DraggableCourse.tsx";
import { ItemTypes } from "../entities/Constants";
import { SemesterProps } from "../entities/four_year_plan";
import { palette, styled } from "@mui/system";
import { useTheme } from "@emotion/react";
// styling for the semester
const style: CSSProperties = {
  height: "15rem",
  width: "25%",
  marginRight: ".5rem",
  marginBottom: ".5rem",
  color: "white",
  padding: "1rem",
  textAlign: "center",
  fontSize: "1rem",
  lineHeight: "normal",
  float: "left",
  whiteSpace: "pre",
  background: "#004990",
  borderRadius: ".5rem",
  overflow: "auto"
};

export const Semester: FC<SemesterProps> = function Semester({
  accept,
  onDrop,
  semesterNumber,
  courses,
  SemesterCredits,
  Warning,
  warningPrerequisiteCourses,
  warningFallvsSpringCourses,
  warningDuplicateCourses,
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
  const backgroundColor = isOver ? "" : "white";

  return (
    <div
      ref={drop}
      className="semester"
      style={{ backgroundColor }}
      data-testid={`semester${semesterNumber}`}
    >
      <p>
        {season} ({SemesterCredits})
      </p>
      {courses.map((course, index) => (
        <Course
          name={course.name}
          subject={course.subject}
          number={course.number}
          idCourse={course.idCourse}
          semesters={course.semesters}
          type={ItemTypes.COURSE}
          credits={course.credits}
          preReq={course.preReq}
          dragSource={`Semester ${semesterNumber}`}
          key={index}
          warningYellowColor={warningDuplicateCourses.find((x) => x === course)}
          warningOrangeColor={warningFallvsSpringCourses.find(
            (x) => x === course
          )}
          warningRedColor={warningPrerequisiteCourses.find((x) => x === course)}
          repeatableForCred={course.repeatableForCred}
        />
      ))}
    </div>
  );
};
