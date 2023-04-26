import React, { FC, useRef, useState } from "react";
import { useDrop } from "react-dnd";
// @ts-expect-error
import { Course } from "./DraggableCourse.tsx";
import { ItemTypes } from "../entities/Constants";
import { SemesterProps } from "../entities/four_year_plan";
import { Assistant, WarningAmber } from "@mui/icons-material";
import {
  Badge,
  Box,
  Chip,
  Grid,
  IconButton,
  Popover,
  Stack,
  Typography,
  Tooltip
} from "@mui/material";
import { CourseList } from "./CourseList";

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
  season,
  suggestedContent
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [quickDrop, setQuickDrop] = useState(false);

  const refPopper = useRef<null | HTMLDivElement>(null);
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
  }
  if (isOver) bgcolor = "success.main";

  const handleOpenSuggester = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseSuggester = (event: any, reason: string): void => {
    if (reason === "quickDrop") {
      setQuickDrop(true);
    }
    setAnchorEl(null);
  };

  const handleCourseDrag = (event: React.DragEvent<HTMLElement>): void => {
    if (refPopper.current !== null) {
      if (
        event.clientX < refPopper.current.offsetLeft ||
        event.clientX >
        refPopper.current.offsetLeft + refPopper.current.offsetWidth ||
        event.clientY < refPopper.current.offsetTop ||
        event.clientY >
        refPopper.current.offsetTop + refPopper.current.offsetHeight
      ) {
        handleCloseSuggester(null, "quickDrop");
      }
    }
  };

  const suggestedContentExists = (): boolean => {
    return (
      suggestedContent?.courses.length > 0 ||
      suggestedContent?.requirements.length > 0
    );
  };

  return (
    <Box
      ref={drop}
      className="semester Semester-root"
      sx={{ bgcolor, minHeight: "7em" }}
      data-testid={`semester${semesterNumber}`}
      key={`semester-${year}-${season}`}
    >
      <Stack>
        <Grid
          container
          sx={{
            alignItems: "center",
            position: "relative"
          }}
        >
          <Grid item flexGrow={1}>
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              minHeight="3em"
              gap="0.3em"
            >
              <Box>{season}</Box>
              <Box>({SemesterCredits})</Box>
              <Box>
                {Warning !== null ? (
                  <Tooltip title={Warning}>
                    <Stack direction="column" justifyContent="center">
                      <WarningAmber
                        data-testid="amber"
                        color={Warning === "Low" ? "warning" : "error"}
                      />
                    </Stack>
                  </Tooltip>
                ) : (
                  ""
                )}
              </Box>
            </Stack>
          </Grid>
          <Grid
            item
            sx={{
              display: "flex",
              position: "absolute",
              right: ".5em",
              width: "auto",
              justifyContent: "end"
            }}
          >
            {suggestedContentExists() && (
              <IconButton
                onClick={handleOpenSuggester}
                data-testid={`semester${semesterNumber}-suggestBtn`}
              >
                <Badge
                  badgeContent={suggestedContent?.courses.length}
                  color="primary"
                >
                  <Assistant color="primary" />
                </Badge>
              </IconButton>
            )}
            <Popover
              anchorEl={anchorEl}
              open={anchorEl !== null}
              onClose={handleCloseSuggester}
              PaperProps={{
                ref: refPopper,
                sx: {
                  borderRadius: ".5em"
                }
              }}
              transitionDuration={quickDrop ? 0 : "auto"}
            >
              <Stack
                sx={{
                  width: "100%"
                }}
                data-testid={`semester${semesterNumber}-suggestPopover`}
              >
                <Typography
                  sx={{
                    px: "1em",
                    py: ".5em",
                    textAlign: "center",
                    fontSize: "1.2em",
                    fontWeight: "bold"
                  }}
                >
                  {suggestedContentExists()
                    ? "Suggested Courses"
                    : "No Suggested Courses"}
                </Typography>
                <Box
                  sx={{
                    bgcolor: "primary.main",
                    px: "1em",
                    pt:
                      suggestedContent?.requirements.length > 0
                        ? ".25em"
                        : "0em",
                    pb: suggestedContent?.courses.length > 0 ? "0em" : ".25em"
                  }}
                >
                  {suggestedContent?.requirements.map((reqText, index) => {
                    return (
                      <Chip
                        key={index}
                        label={reqText}
                        variant="outlined"
                        sx={{
                          margin: ".5em",
                          marginLeft: index === 0 ? "0em" : ".5em",
                          color: "black",
                          bgcolor: "gainsboro",
                          borderColor: "black"
                        }}
                        size={"small"}
                      />
                    );
                  })}
                </Box>
                {suggestedContent?.courses?.length > 0 && (
                  <CourseList
                    accept={ItemTypes.COURSE}
                    onDrop={console.log}
                    onCourseDrag={handleCourseDrag}
                    onCourseDragEnd={() => setQuickDrop(false)}
                    courses={suggestedContent?.courses}
                    sx={{
                      marginBottom: "0px",
                      borderRadius: "0px",
                      padding: "1em",
                      pt:
                        suggestedContent?.requirements.length > 0
                          ? "0em"
                          : "1em"
                    }}
                  />
                )}
              </Stack>
            </Popover>
          </Grid>
        </Grid>
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
            idCategory={course.idCategory}
          />
        ))}
      </Stack>
    </Box>
  );
};
