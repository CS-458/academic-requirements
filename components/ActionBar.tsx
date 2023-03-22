import * as React from "react";
import { Box, Grid } from "@mui/material";
import ScheduleUpload from "./ScheduleUploadModal";
import { UserSavedSchedule } from "../entities/four_year_plan";

export default function BoxSx(props: {
  scheduleData: UserSavedSchedule["scheduleData"]
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
        />
      </Box>
    </div>
  );
}
