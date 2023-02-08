import React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Grid from "@mui/material/Grid";

export default function DeleteableInput(props: {
  courses?: string[];
  deleteCourse: (value: string) => void;
}): JSX.Element {
  console.log("DeletableInp: ", props.courses);
  return (
    <div>
      <List dense={true} sx={{ width: "100%", maxHeight: "75vh", overflow: "auto" }}>
      {props.courses?.map((value) => {
        return (
          <Grid item xs={2} sm={4} md={4} key={value}>
            <ListItem
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => {
                  // Delete the course if the garbage can icon is clicked
                  props.deleteCourse(value);
                }}>
                  <DeleteIcon/>
                </IconButton>
              }
            >
              <ListItemText
                primary= {value}
              />
            </ListItem>
        </Grid>
        );
      })}
      </List>
    </div>
  );
};
