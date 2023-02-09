import { Autocomplete, TextField } from "@mui/material";
import React from "react";

// Note: drop down often key-value pair behind scenes.
export default function SearchableDropdown<T>(props: {
  options: Array<{ label: string; value: T } | T>;
  label: string;
  onSelectOption: (option?: T) => void;
}): JSX.Element {
  return (
    <Autocomplete
      disablePortal
      autoHighlight
      options={props.options.map((v) => {
        if (typeof v === "object" && v != null && "label" in v && "value" in v) {
          return v;
        } else {
          return {
            label: `${v}`,
            value: v
          };
        }
      })}
      onChange={(_a, value) => {
        props.onSelectOption(value?.value);
      }}
      sx={{ width: "75%", pt: 6, pl: 3, textAlign: "center" }}
      isOptionEqualToValue={(a, b) => a.value === b.value}
      renderInput={(params) => <TextField {...params} label={props.label} />}
    />
  );
}
