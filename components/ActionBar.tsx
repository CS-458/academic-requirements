/*
  Nick Raffel
  This is just a component for the Action Bar on the left Side that houses the save button
*/

import React from "react";
import { Box } from "@mui/material";
import ScheduleUpload from "./ScheduleUploadModal";
import { UserSavedSchedule } from "../entities/four_year_plan";

// Schedule Data and SetAlertData are being passed through here into the Schedule Upload Modal
export default function BoxSx(props: {
  scheduleData: UserSavedSchedule["scheduleData"],
  setAlertData: (msg: string, severity: string) => void
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
        <ScheduleUpload
          scheduleData={props.scheduleData}
          setAlertData={props.setAlertData}
        />
      </Box>
    </div>
  );
}
