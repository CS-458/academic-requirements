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
  // makes the modal pop up
  const handleReload = (): any => {
    // loops through the SemesterType[] json
    const semesters: SemesterType[] = [];
    if (userMajor()?.load_four_year_plan === true) {
      const semestersReload = props.initializeSemesters();
      // props.setSemesters(semestersReload);
      props.loadFYP(semestersReload);
      console.log(semesters + "INSIDE IF");
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
      };
      console.log(semesters + "INSIDE ELSE");
      props.setSemesters(semesters);
    }
    console.log(semesters + "BASSE");
    props.setSavedErrors([]);
    props.resetRequirements();
    props.resetRedo([]);
    props.resetMoved([]);
  };

  return (
    <IconButton onClick={handleReload}>
        <RefreshIcon data-testid="reloadButton"/>
    </IconButton>
  );
}
