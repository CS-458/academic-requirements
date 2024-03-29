import React from "react";
import { Delete } from "@mui/icons-material";
import { Chip, Grid } from "@mui/material";
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
            deleteIcon={<Delete data-testid={`delete-icon-${course}`} />}
            sx={{ width: "9em", margin: "0.5em" }}
          />
        </Grid>
      ))}
    </Box>
  );
}
