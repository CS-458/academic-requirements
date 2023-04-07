import React from "react";
import { Redo } from "@mui/icons-material";
import { IconButton } from "@mui/material";
export default function UndoButton(props: {
  handleRedoCourse: () => any,
  courses: any[]
}): any {
  return (
    <IconButton onClick={props.handleRedoCourse} data-testid="redoButton" disabled={props.courses.length === 0}>
      <Redo />
    </IconButton>
  );
}
