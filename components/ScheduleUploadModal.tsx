// Nick Raffel
// This is the modal for saving the schedule

import React, { useEffect } from "react";
import {
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  Stack
} from "@mui/material";
import {
  Collections,
  PictureAsPdf,
  Save as SaveIcon
} from "@mui/icons-material";
import { uploadSchedule, userToken } from "../services/user";
import { UserSavedSchedule } from "../entities/four_year_plan";

function show(el: Element): void {
  if (el instanceof HTMLElement) {
    if (el.matches(".MuiCollapse-root") || el.matches(".MuiCollapse-wrapper")) {
      el.style.visibility = "visible";
      el.style.height = "auto";
      el.style.overflow = "auto";
    }
  }
  for (let i = 0; i < el.children.length; i++) {
    show(el.children[i]);
  }
}

export function hide(el: Element): void {
  if (!el.matches(".printed")) {
    if (el.querySelector(".printed") !== null) {
      for (let i = 0; i < el.children.length; i++) {
        hide(el.children[i]);
      }
    } else {
      if (el instanceof HTMLElement) {
        el.setAttribute("data-screen-display", el.style.display);
        el.style.display = "none";
      }
    }
  } else if (el instanceof HTMLElement) {
    el.setAttribute("data-screen-pos", el.style.position);
    el.style.position = "absolute";
    el.style.top = "0";
    el.style.left = "0";
    el.style.width = "100vw";
    show(el);
  }
}

export function unHide(): void {
  document.querySelectorAll("*").forEach((el) => {
    if (el instanceof HTMLElement) {
      const display = el.getAttribute("data-screen-display");
      if (display !== null) {
        el.style.display = "";
      }
      const pos = el.getAttribute("data-screen-pos");
      if (pos !== null) {
        el.style.position = "";
        el.style.top = "";
        el.style.left = "";
        el.style.width = "";
      }
      if (
        el.matches(".MuiCollapse-root") ||
        el.matches(".MuiCollapse-wrapper")
      ) {
        el.style.visibility = "";
        el.style.height = "";
      }
    }
  });
}

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
  semRef: React.RefObject<React.ReactInstance>;
  defaultName?: string;
}): any {
  const [open, setOpen] = React.useState(false);

  // sets the schdeule name if there is a custom name
  const [scheduleName, setScheduleName] = React.useState(
    props.defaultName ?? getDateTime()
  );

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
    if (scheduleName.replace(/\s/g, "").length === 0) {
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

  const downloadPng = (): void => {
    const ref = props.semRef;
    if (ref !== undefined) {
      import("react-component-export-image")
        .then(async (res) => {
          hide(document.body);
          await res.exportComponentAsPNG(ref, { fileName: scheduleName });
          unHide();
        })
        .catch(console.error);
    } else {
      console.log("WRONG");
    }
  };

  const handlePDF = (): void => {
    window.print();
  };

  useEffect(() => {
    window.addEventListener("beforeprint", () => {
      hide(document.body);
    });
    window.addEventListener("afterprint", () => {
      unHide();
    });
  }, []);

  const saveTooltip =
    token === undefined ? "Must be logged in to save" : "Save";

  return (
<Stack direction="column" alignItems="center">
      <Tooltip title={saveTooltip} placement="right" arrow>
        <span>
          <IconButton
            onClick={handleClickOpen}
            disabled={token === undefined}
            data-testid="saveButton"
            color="primary"
          >
            <SaveIcon />
          </IconButton>
        </span>
      </Tooltip>
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
          <Button onClick={downloadPng}>Image</Button>
          <Button onClick={handlePDF}>PDF</Button>
          <Button onClick={onClickExportSchedule} data-testid="nestedSavedButton">Save</Button>
        </DialogActions>
      </Dialog>
      <Tooltip title="Save as PDF" placement="right" arrow>
        <IconButton
          onClick={handlePDF}
          color="primary"
          sx={{ width: "fit-content" }}
        >
          <PictureAsPdf data-testid="SavePdf" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Save as PNG" placement="right" arrow>
        <IconButton
          onClick={downloadPng}
          color="primary"
          sx={{ width: "fit-content" }}
        >
          <Collections data-testid="SavePng" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
