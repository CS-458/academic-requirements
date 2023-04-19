/*
  Nick Raffel
  This is the modal for saving the schedule
*/

import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import {
  UserSavedSchedule,
  SemesterType,
  movedCourse
} from "../entities/four_year_plan";
import { userMajor } from "../services/user";
import { CourseError } from "./FourYearPlanPage";

export default function FormDialog(props: {
  scheduleData: UserSavedSchedule["scheduleData"];
  sems: SemesterType[];
  setSavedErrors: (e: string[]) => void;
  resetRequirements: () => void;
  setSemesters: (v: SemesterType[]) => void;
  handleReturn: (V: { idCourse: number; dragSource: string }) => void;
  resetRedo: (r: movedCourse[]) => void;
  resetMoved: (u: movedCourse[]) => void;
  loadFYP: (semesters: SemesterType[]) => void;
  initializeSemesters: () => any;
  setWarningPreReq: (ce: CourseError[]) => any;
  setWarningFallvsSpring: (ce: CourseError[]) => any;
  setWarningDupCourses: (ce: CourseError[]) => any;
}): any {
  // Handles the reloading of the FYPP
  const handleReload = (): any => {
    props.setSavedErrors([]);
    props.resetRedo([]);
    props.resetMoved([]);
    props.resetRequirements();
    props.setWarningDupCourses([]);
    props.setWarningFallvsSpring([]);
    props.setWarningPreReq([]);
    if (userMajor()?.load_four_year_plan === true) {
      const semestersReload = props.initializeSemesters();
      props.loadFYP(semestersReload);
    } else {
      const semesterReload = props.initializeSemesters();
      props.setSemesters(semesterReload);
    }
  };

  return (
    <Tooltip title="Reload initial schedule" placement="right" arrow>
      <IconButton onClick={handleReload} sx={{ width: "fit-content" }}>
        <RefreshIcon data-testid="reloadButton" />
      </IconButton>
    </Tooltip>
  );
}
