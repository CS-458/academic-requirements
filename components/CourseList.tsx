import type { CSSProperties, FC } from "react";
import React, { memo } from "react";
import { useDrop } from "react-dnd";
import { ItemTypes } from "../entities/Constants";
import { Course } from "./DraggableCourse";
import { CourseListType } from "../entities/four_year_plan";
import { Box } from "@mui/material";
// Styling for the course list
const style: CSSProperties = {
  width: "100%",
  marginRight: ".5rem",
  marginBottom: ".5rem",
  color: "white",
  padding: "1rem",
  textAlign: "center",
  fontSize: "1rem",
  lineHeight: "normal",
  float: "left",
  borderRadius: ".5rem",
  overflow: "auto",
  flexGrow: 1
};

export const CourseList: FC<CourseListType> = memo(function CourseList({
  accept,
  onDrop,
  courses,
  onCourseDrag,
  onCourseDragEnd,
  sx
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
  let bgcolor = "primary.main";
  if (isActive) {
    bgcolor = "darkgreen";
  }

  return (
    <Box
      ref={drop}
      sx={{ ...style, bgcolor, ...sx }}
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
            data-testid="course"
            onDrag={onCourseDrag}
            onDragEnd={onCourseDragEnd}
          />
        )
      )}
    </Box>
  );
});
