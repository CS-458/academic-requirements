import type { CSSProperties, FC } from "react";
import React, { memo } from "react";
import { useDrop } from "react-dnd";
import { ItemTypes } from "../entities/Constants";
import { Course } from "./DraggableCourse";
import { CourseListType } from "../entities/four_year_plan";
// Styling for the course list
const style: CSSProperties = {
  height: "30rem",
  width: "90%",
  marginRight: ".5rem",
  marginBottom: ".5rem",
  color: "white",
  padding: "1rem",
  textAlign: "center",
  fontSize: "1rem",
  lineHeight: "normal",
  float: "left",
  background: "#004990",
  borderRadius: ".5rem",
  overflow: "auto"
};

export const CourseList: FC<CourseListType> = memo(function CourseList({
  accept,
  onDrop,
  courses
}) {
  // defines the drop
  const [{ isOver }, drop] = useDrop({
    accept,
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  // changes the background color on hover over course list
  const isActive: boolean = isOver;
  let backgroundColor = "#004990";
  if (isActive) {
    backgroundColor = "darkgreen";
  }

  return (
    <div
      ref={drop}
      style={{ ...style, backgroundColor }}
      data-testid="courseListDropTarget"
    >
      {isActive ? "Release to drop" : ""}
      {courses.map(
        (
          {
            name,
            subject,
            number,
            semesters,
            credits,
            preReq,
            idCourse,
            idCategory,
            repeatableForCred
          },
          index
        ) => (
          <Course
            name={name}
            subject={subject}
            number={number}
            semesters={semesters}
            credits={credits}
            type={ItemTypes.COURSE}
            key={index}
            dragSource={"CourseList"}
            preReq={preReq}
            idCourse={idCourse}
            idCategory={idCategory}
            warningYellowColor={undefined}
            warningOrangeColor={undefined}
            warningRedColor={undefined}
            repeatableForCred={repeatableForCred}
          />
        )
      )}
    </div>
  );
});
