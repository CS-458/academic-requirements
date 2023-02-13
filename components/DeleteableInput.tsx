import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import Grid from "@mui/material/Grid";
import { Chip } from "@mui/material";
import { Box } from "@mui/system";

export default function DeleteableInput(props: {
  courses?: string[];
  deleteCourse: (value: string) => void;
}): JSX.Element {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(10em, auto))"
      }}
    >
      {props.courses?.map((course) => (
        <Grid key={course}>
          <Chip
            label={course}
            onDelete={() => props.deleteCourse(course)}
            deleteIcon={<DeleteIcon />}
            sx={{ width: "9em", margin: "0.5em" }}
          />
        </Grid>
      ))}
    </Box>
  );
}
