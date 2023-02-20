import React, { CSSProperties, FC } from "react";
import { useDrop } from "react-dnd";
// @ts-expect-error
import { Course } from "./DraggableCourse.tsx";
import { ItemTypes } from "../entities/Constants";

// styling for the semester
const style: CSSProperties = {
  height: "15rem",
  width: "19%",
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

export interface SemesterProps {
  accept: Course;
  lastDroppedItem?: any;
  onDrop: (item: any) => void;
  semesterNumber: number;
  courses: Course[];
  SemesterCredits: number;
  Warning: string;
  warningPrerequisiteCourses: Course[];
  warningFallvsSpringCourses: Course[];
  warningDuplicateCourses: Course[];
}

export const Semester: FC<SemesterProps> = function Semester({
  accept,
  onDrop,
  semesterNumber,
  courses,
  SemesterCredits,
  Warning,
  warningPrerequisiteCourses,
  warningFallvsSpringCourses,
  warningDuplicateCourses
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
  const isActive = isOver;
  let backgroundColor = "#004990";
  if (isActive) {
    backgroundColor = "darkgreen";
  }

  return (
    <div
      ref={drop}
      style={{ ...style, backgroundColor }}
      data-testid="semester"
    >
      {isActive
        ? "Release to drop"
        : `Semester ${semesterNumber} ${
            semesterNumber % 2 === 0 ? "\nSpring\n" : "\nFall\n"
          }Credits ${SemesterCredits}`}
      {`${Warning}`}

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
          dragSource={`Semester ${semesterNumber - 1}`}
          key={index}
          warningYellowColor={warningDuplicateCourses.find((x) => x === course)}
          warningOrangeColor={warningFallvsSpringCourses.find(
            (x) => x === course
          )}
          warningRedColor={warningPrerequisiteCourses.find((x) => x === course)}
        />
      ))}
    </div>
  );
};
