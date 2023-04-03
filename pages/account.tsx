import { Stack, Paper } from "@mui/material";
import React, { useEffect, useState } from "react";
import { UserSavedSchedule } from "../entities/four_year_plan";
import { getScheduleByName } from "../services/user";

function scheduleRow(s: UserSavedSchedule): JSX.Element {
  return <Paper>{s.name}</Paper>;
}

function App(): JSX.Element {
  // Functions and variables for controlling an error popup
  const [schedules, setSchedules] = useState<UserSavedSchedule[]>([]);
  useEffect(() => {
    getScheduleByName("")
      .then((schedules) => setSchedules(schedules))
      .catch((e) => console.error(e));
  }, []);
  return (
    <Stack direction="column">
      <Stack direction="row">
        <h3>Account Actions</h3>
        <p>TODO</p>
      </Stack>
      <Stack direction="column">
        <h3>Saved Schedules</h3>
        <Stack>{schedules.map(scheduleRow)}</Stack>
      </Stack>
    </Stack>
  );
}

export default App;
