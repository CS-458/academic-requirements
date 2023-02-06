import type { FC } from "react";
import React, { memo } from "react";
import { useDrag } from "react-dnd";
import clsx from "clsx";

// defines the expected course properties
export interface CourseProps {
  credits: number;
  name: string;
  subject: string;
  number: number;
  semesters: string;
  type: string;
  preReq: string;
  dragSource: string;
  warningYellowColor?: boolean;
  warningOrangeColor?: boolean;
  warningRedColor?: boolean;
  id: number;
  idCategory: number;
}

export const Course: FC<CourseProps> = memo(function Course({
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
  id,
  idCategory
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
        id,
        idCategory
      },
      collect: (monitor: any) => ({
        opacity: monitor.isDragging() !== null ? 0.4 : 1
      })
    }),
    [id, type, dragSource] // what is collected by the semester and course list when you drop it
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
      style={{ opacity }}
      data-testid="course"
      className={clsx(
        "CourseText",
        warningYellowColor === true &&
          warningRedColor !== true &&
          warningOrangeColor !== true &&
          "CourseWarningYellow",
        warningOrangeColor === true &&
          warningRedColor !== true &&
          "CourseWarningOrange",
        warningRedColor === true && "CourseWarningRed"
      )}
    >
      {/* {isDropped ? <s>{name}</s> : name}  */}
      {subject}-{number}
      <br />
      {name}
      <br />
      credits: {credits}
      <br />
      <a href={getURL(subject, `${number}`)} target="_blank">
        Description
      </a>
    </div>
  );
});
