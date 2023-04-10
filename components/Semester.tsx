import React, { CSSProperties, FC } from "react";
import { useDrop } from "react-dnd";
// @ts-expect-error
import { Course } from "./DraggableCourse.tsx";
import { ItemTypes } from "../entities/Constants";
import { SemesterProps, warning } from "../entities/four_year_plan";
import { Box, Grid, IconButton, Stack } from "@mui/material";
import { Assistant } from '@mui/icons-material';

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
  if (Warning !== null) bgcolor = "warning.main";
  if (isOver) bgcolor = "success.main";

  return (
    <Box
      ref={drop}
      className="semester Semester-root"
      sx={{ bgcolor, minHeight: "7em" }}
      data-testid={`semester${semesterNumber}`}
      key={`semester-${year}-${season}`}
    >
      <Stack>
        <Grid container sx={{
          alignItems: "center",
          position: "relative"
        }}>
          <Grid item flexGrow={1}>
            <p>
              {season} ({SemesterCredits}) {Warning !== null ? Warning : ""}
            </p>
          </Grid>
          <Grid item sx={{
            display: "flex",
            position: "absolute",
            width: "100%",
            justifyContent: "end"
          }}>
            <IconButton>
              <Assistant color="primary"/>
            </IconButton>
          </Grid>
        </Grid>
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
      </Stack>
    </Box>
  );
};
