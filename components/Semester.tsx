import React, { CSSProperties, FC } from "react";
import { useDrop } from "react-dnd";
// @ts-expect-error
import { Course } from "./DraggableCourse.tsx";
import { ItemTypes } from "../entities/Constants";
import { SemesterProps } from "../entities/four_year_plan";

export const Semester: FC<SemesterProps> = function Semester({
  accept,
  onDrop,
  semesterNumber,
  courses,
  SemesterCredits,
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
      className="semester Semester-root"
      style={{ backgroundColor }}
      data-testid={`semester${semesterNumber}`}
      key={`semester-${year}-${season}`}
    >
      <p>
        {season} ({SemesterCredits})
      </p>
      {courses.map((course) => (
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
