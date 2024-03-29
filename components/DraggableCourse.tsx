import type { FC } from "react";
import React, { memo } from "react";
import { useDrag } from "react-dnd";
import clsx from "clsx";
import { DragCourseType } from "../entities/four_year_plan";

export const Course: FC<DragCourseType> = memo(function Course({
  name,
  subject,
  number,
  type,
  credits,
  semesters,
  preReq,
  dragSource,
  warningYellowColor,
  warningOrangeColor,
  warningRedColor,
  idCourse,
  idCategory,
  repeatableForCred,
  onDrag,
  onDragEnd
}) {
  // defines the drag action
  const [{ opacity }, drag] = useDrag(
    () => ({
      type,
      item: {
        name,
        subject,
        number,
        type,
        credits,
        semesters,
        preReq,
        dragSource,
        warningYellowColor,
        warningOrangeColor,
        warningRedColor,
        idCourse,
        idCategory,
        repeatableForCred
      },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.8 : 1
      }),
      end: (e: any) => {
        if (onDragEnd !== undefined) {
          onDragEnd(e);
        }
      }
    }),
    [idCourse, type, dragSource] // what is collected by the semester and course list when you drop it
  );

  // Gets the URL to the UW Stout Bulletin for the given Course
  function getURL(subject: string, number: string): string {
    const URL =
      "https://bulletin.uwstout.edu/content.php?filter%5B27%5D=" +
      subject +
      "&filter%5B29%5D=" +
      number +
      "&filter%5Bcourse_type%5D=-1&filter%5Bkeyword%5D=&filter%5B32%5D=1&filter%5Bcpage%5D=1&cur_cat_oid=21&expand=&navoid=544&search_database=Filter#acalog_template_course_filter";
    return URL;
  }

  return (
    <div
      ref={drag}
      onDrag={(e: any) => {
        if (onDrag !== undefined) {
          onDrag(e);
        }
      }}
      style={{ opacity }}
      data-testid="course"
      className={clsx(
        "Course-root",
        "CourseText",
        warningYellowColor !== undefined &&
        warningRedColor === undefined &&
        warningOrangeColor === undefined &&
        "CourseWarningYellow",
        warningOrangeColor !== undefined &&
        warningRedColor === undefined &&
        "CourseWarningOrange",
        warningRedColor !== undefined && "CourseWarningRed"
      )}
      key={`course-${idCourse}`}
    >
      {subject}-{number}
      <br />
      {name}
      <br />
      Credits: {credits}
      <br />
      <a href={getURL(subject, `${number}`)} target="_blank">
        Description
      </a>
    </div>
  );
});
