/*
  Nick Raffel
  This is the modal for saving the schedule
*/

import React from "react";
import {
  IconButton
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { UserSavedSchedule, SemesterType, movedCourse } from "../entities/four_year_plan";
import { userMajor } from "../services/user";

export default function FormDialog(props: {
  scheduleData: UserSavedSchedule["scheduleData"];
  sems: SemesterType[];
  setSavedErrors: (e: string[]) => void;
  resetRequirements: () => void;
  setSemesters: (v: SemesterType[]) => void;
  handleReturn: (V: { idCourse: number, dragSource: string }) => void;
  resetRedo: (r: movedCourse[]) => void;
  resetMoved: (u: movedCourse[]) => void;
  loadFYP: (semesters: SemesterType[]) => void;
  initializeSemesters: () => any
}): any {
  // Handles the reloading of the FYPP
  const handleReload = (): any => {
    props.setSavedErrors([]);
    props.resetRedo([]);
    props.resetMoved([]);
    props.resetRequirements();
    if (userMajor()?.load_four_year_plan === true) {
      const semestersReload = props.initializeSemesters();
      props.loadFYP(semestersReload);
    } else {
      const semesterReload = props.initializeSemesters();
      props.setSemesters(semesterReload);
    }
  };

  return (
    <IconButton onClick={handleReload}>
        <RefreshIcon data-testid="reloadButton"/>
    </IconButton>
  );
}
