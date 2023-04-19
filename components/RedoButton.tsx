import React from "react";
import { Redo } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
export default function UndoButton(props: {
  handleRedoCourse: () => any;
  courses: any[];
}): any {
  return (
    <Tooltip title="Redo" placement="right" arrow>
      <span>
        <IconButton
          onClick={props.handleRedoCourse}
          data-testid="redoButton"
          disabled={props.courses.length === 0}
        >
          <Redo />
        </IconButton>
      </span>
    </Tooltip>
  );
}
