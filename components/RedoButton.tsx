import React from "react";
import { Redo } from "@mui/icons-material";
import { IconButton } from "@mui/material";
export default function UndoButton(props: { handleRedoCourse: () => any }): any {
  return (
    <IconButton onClick={props.handleRedoCourse}>
        <Redo />
    </IconButton>
  );
}
