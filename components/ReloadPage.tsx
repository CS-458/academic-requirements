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
}): any {
  // Handles the reloading of the FYPP
  const handleReload = (): any => {
    // reset requirments
    props.resetRequirements();
    const semesters: SemesterType[] = [];
    // if the user has a FYP
    if (userMajor()?.load_four_year_plan === true) {
      const semestersReload = props.initializeSemesters();
      props.loadFYP(semestersReload);
    } else {
      for (let i = 0; i < props.sems.length; i++) {
        semesters.push({
          accepts: props.sems[i].accepts,
          courses: [],
          season: props.sems[i].season,
          SemesterCredits: 0,
          semesterNumber: props.sems[i].semesterNumber,
          Warning: null,
          year: props.sems[i].year
        });
      }
      props.setSemesters(semesters);
    }
    props.setSavedErrors([]);
    props.resetRedo([]);
    props.resetMoved([]);
  };

  return (
    <Tooltip title="Reload initial schedule" placement="right" arrow>
      <IconButton onClick={handleReload}>
        <RefreshIcon data-testid="reloadButton" />
      </IconButton>
    </Tooltip>
  );
}
