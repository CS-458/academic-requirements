import React from "react";
import { Undo } from "@mui/icons-material";
import { IconButton } from "@mui/material";
export default function UndoButton(props: { handleUndoCourse: () => any }): any {
  return (
    <IconButton onClick={props.handleUndoCourse} data-testid="undoButton">
      <Undo/>
    </IconButton>
  );
}
