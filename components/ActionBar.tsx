/*
  Nick Raffel
  This is just a component for the Action Bar on the left Side that houses the save button
*/

import React from "react";
import { Box } from "@mui/material";
import ScheduleUpload from "./ScheduleUploadModal";
import ReloadPage from "./ReloadPage";
import { SemesterType, UserSavedSchedule } from "../entities/four_year_plan";

// Schedule Data and SetAlertData are being passed through here into the Schedule Upload Modal
export default function BoxSx(props: {
  scheduleData: UserSavedSchedule["scheduleData"],
  sems: SemesterType[],
  handleReturn: (V: { idCourse: number, dragSource: string }) => void
  resetRequirements: () => void
  setAlertData: (msg: string, severity: string) => void
  setSemesters: (v: SemesterType[]) => void;
  children: JSX.Element | JSX.Element[]
}): any {
  return (
    <div>
      <Box
        sx={{
          height: "100%",
          backgroundColor: "white",
          paddingTop: "2em",
          boxShadow: 9
        }}
      >
        {props.children}
        <ScheduleUpload
          scheduleData={props.scheduleData}
          setAlertData={props.setAlertData}
        />
        <ReloadPage
          scheduleData={props.scheduleData}
          sems={props.sems}
          resetRequirements={props.resetRequirements}
          handleReturn={props.handleReturn}
          setSemesters={props.setSemesters}
        />
      </Box>
    </div>
  );
}
