/*
  Nick Raffel
  This is the modal for saving the schedule
*/

import React from "react";
import {
  IconButton
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { UserSavedSchedule, SemesterType, RequirementComponentType, CourseType } from "../entities/four_year_plan";

export default function FormDialog(props: {
  scheduleData: UserSavedSchedule["scheduleData"];
  sems: SemesterType[];
  requirementsData: RequirementComponentType[];
  setSemesters: (v: SemesterType[]) => void;
  handleReturn: (y: CourseType) => void;
}): any {
  // makes the modal pop up
  const handleReload = (): any => {
    // loops through the SemesterType[] json
    const semesters: SemesterType[] = [];
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

    props.sems.forEach((sem) => {
      sem.courses.forEach((course) => {
        console.log(course);
        props.handleReturn(course);
      });
    });

    props.setSemesters(semesters);
  };

  return (
    <IconButton onClick={handleReload} data-testid="rloadButton">
        <RefreshIcon/>
    </IconButton>
  );
}
