import type { CSSProperties, FC } from "react";
import React, { memo } from "react";
import { useDrop } from "react-dnd";
import { ItemTypes } from "../entities/Constants";
import { Course } from "./DraggableCourse";

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

export interface CourseListProps {
  accept: Course;
  onDrop: (item: any) => void;
  courses: Course[];
}

export const CourseList: FC<CourseListProps> = memo(function CourseList({
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
  const isActive = isOver;
  let backgroundColor = "#004990";
  if (isActive) {
    backgroundColor = "darkgreen";
  }

  return (
    <div ref={drop} style={{ ...style, backgroundColor }}>
      {isActive ? "Release to drop" : "CourseList"}
      {courses.map(
        ({ name, subject, number, semesters, credits, preReq }, index) => (
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
          />
        )
      )}
    </div>
  );
});
