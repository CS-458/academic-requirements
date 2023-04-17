import React from "react";
import { Undo } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
export default function UndoButton(props: {
  handleUndoCourse: () => any;
  courses: any[];
}): any {
  return (
    <Tooltip title="Undo" placement="right" arrow>
      <span>
        <IconButton
          onClick={props.handleUndoCourse}
          data-testid="undoButton"
          disabled={props.courses.length === 0}
        >
          <Undo />
        </IconButton>
      </span>
    </Tooltip>
  );
}
