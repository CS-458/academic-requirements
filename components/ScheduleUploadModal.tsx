import * as React from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import ErrorPopup from "./ErrorPopup";
import SaveIcon from "@mui/icons-material/Save";
import { uploadSchedule, userToken } from "../services/user";
import { UserSavedSchedule } from "../entities/four_year_plan";

export default function FormDialog(props: {
  scheduleData: UserSavedSchedule["scheduleData"]
}): any {
  const [open, setOpen] = React.useState(false);

  const [scheduleName, setScheduleName] = React.useState(getDateTime());
  const [visibility, setVisibility] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [title, setTitle] = React.useState("Warning");

  // makes the modal pop up
  const handleClickOpen = (): void => {
    setOpen(true);
  };

  // closes/hides the modal
  const handleClose = (): void => {
    setOpen(false);
  };

  const popupCloseHandler = (): void => {
    setVisibility(false);
  };

  // gets the user token
  const token = userToken();

  // Function that gets the current Date and time
  // returns mm/dd/yyyy/hour:min:sec
  function getDateTime(): string {
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

  // function that Uploads the Schedule to the Database
  async function exportSchedule(): Promise<void> {
    if (scheduleName === null || scheduleName === "") {
      setVisibility(true);
      setErrorMessage("Schedule MUST have a name!");
      setScheduleName(getDateTime());
    } else {
      try {
        await uploadSchedule(token, scheduleName, props.scheduleData);
      } catch (err: any) {
        if (err.message === "User is not logged in") {
          setVisibility(true);
          setErrorMessage("Not Logged in. Please Log in");
          console.log("not logged in error");
          return;
        }
      }
      setVisibility(true);
      setErrorMessage("Saved Successfully");
      setTitle("Success!");
      handleClose();
      console.log("Saved successfully");
    }
  }

  // this is needed because so we don"t get an error for calling a function that
  // returns a voided promise
  const onClickExportSchedule = (): void => {
    void exportSchedule();
  };

  return (
    <div>
      <Button onClick={handleClickOpen}>
        <SaveIcon/>
      </Button>
      <Dialog open={open} onClose={handleClose}
          sx ={{ zIndex: "1" }}>
        <DialogTitle>Save Schedule</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Schedule Name
          </DialogContentText>
          <TextField
            autoFocus
            id="schedule-name"
            value={scheduleName}
            fullWidth
            variant="standard"
            onChange={e => {
              setScheduleName(e.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={onClickExportSchedule}>Save</Button>
        </DialogActions>
      </Dialog>
      <ErrorPopup
          onClose={popupCloseHandler}
          show={visibility}
          title={title}
          error={errorMessage}
        />
    </div>
  );
}
