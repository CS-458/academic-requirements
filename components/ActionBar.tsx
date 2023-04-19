/*
  Nick Raffel
  This is just a component for the Action Bar on the left Side that houses the save button
*/

import React from "react";
import { Box, Stack } from "@mui/material";

// Schedule Data and SetAlertData are being passed through here into the Schedule Upload Modal
export default function BoxSx(props: {
  children: JSX.Element | JSX.Element[]
}): any {
  return (
    <div>
      <Stack
        sx={{
          height: "100%",
          backgroundColor: "white",
          paddingTop: "2em",
          boxShadow: 9
        }}
        direction="column"
        alignItems="center"
      >
        {props.children}
      </Stack>
    </div>
  );
}
