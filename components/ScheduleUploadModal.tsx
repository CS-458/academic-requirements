/*
  Nick Raffel
  This is the modal for saving the schedule
*/

import React, { useRef } from "react";
import {
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { uploadSchedule, userToken } from "../services/user";
import { UserSavedSchedule, FourYearPlanType } from "../entities/four_year_plan";
import { toPng, toJpeg } from "html-to-image";

// Function that gets the current Date and time
// returns mm/dd/yyyy/hour:min:sec
export function getDateTime(): string {
  // calls to get the date
  const today = new Date();
  // Parses the correct data from today var
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  const hour = today.getHours() % 12;
  const min = today.getMinutes();
  const sec = today.getSeconds();
  // concats the hour min and sec
  const time = `${hour}:${min}:${sec}`;
  return `${month}-${day}-${year}/${time}`;
}

export default function FormDialog(props: {
  scheduleData: UserSavedSchedule["scheduleData"];
  setAlertData: (msg: string, severity: string) => void;
  semRef: any;
}): any {
  const [open, setOpen] = React.useState(false);

  // sets the schdeule name if there is a custom name
  const [scheduleName, setScheduleName] = React.useState(getDateTime());

  // Function that sets the alert
  function throwAlert(error: string, errorSeverity: string): void {
    props.setAlertData(error, errorSeverity);
  }

  // makes the modal pop up
  const handleClickOpen = (): void => {
    setOpen(true);
  };

  // closes/hides the modal
  const handleClose = (): void => {
    setOpen(false);
  };

  // gets the user token
  const token = userToken();

  // function that Uploads the Schedule to the Database
  async function exportSchedule(): Promise<void> {
    let name = scheduleName;
    // if the name space is empty/null, or only contains white space
    if (scheduleName === null || scheduleName.replace(/\s/g, "").length === 0) {
      name = getDateTime();

      setScheduleName(name);
    }
    // try to upload the schedule
    try {
      await uploadSchedule(token, name, props.scheduleData);
    } catch (err: any) {
      // if the not logged in error is caught throw it
      if (err.message === "User is not logged in") {
        throwAlert(
          "User Not Logged in! Please Log in to save your Schedule.",
          "warning"
        );
        return;
      } else {
        throwAlert(`${err.message}`, "warning");
        return;
      }
    }
    throwAlert("Successfully Saved Schedule as " + name + "!", "success");
    handleClose();
  }

  // this is needed because so we don"t get an error for calling a function that
  // returns a voided promise
  const onClickExportSchedule = (): void => {
    void exportSchedule();
  };

  const downloadJpg = (): void => {
    const ref = props.semRef;
    if (ref !== undefined) {
      toJpeg(ref, { quality: 0.95 }).then(function(dataUrl) {
        const link = document.createElement("a");
        link.download = scheduleName + ".jpg";
        link.href = dataUrl;
        link.click();
        console.log("DWAD");
      });
    } else {
      console.log("WRONG");
    }
  };

  const handlePDF = (): void => {

  };

  return (
    <div>
      <IconButton onClick={handleClickOpen} data-testid="saveButton" color="primary">
        <SaveIcon/>
      </IconButton>
      <Dialog open={open} onClose={handleClose} data-testid="saveModal">
        <DialogTitle>Save Schedule</DialogTitle>
        <DialogContent>
          <TextField
            data-testid="textfeild"
            autoFocus
            id="schedule-name"
            value={scheduleName}
            fullWidth
            variant="standard"
            label="Schedule Name"
            onChange={(e) => {
              setScheduleName(e.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={downloadJpg}>Image</Button>
          <Button onClick={handlePDF}>PDF</Button>
          <Button onClick={onClickExportSchedule}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
