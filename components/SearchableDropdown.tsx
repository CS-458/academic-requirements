import { Autocomplete, TextField } from "@mui/material";
import React from "react";

// Note: drop down often key-value pair behind scenes.
export default function SearchableDropdown<T>(props: {
  options: Array<{ label: string; value: T }>;
  label: string;
  onSelectOption: (option?: T) => void;
}): JSX.Element {
  // Runs a debug message with the selected major
  // and passes the name of the selected class to onSelectOption
  function onChangeOption(
    _a: any,
    option: { label: string; value: T } | null
  ): void {
    props.onSelectOption(option?.value);
  }
  return (
    <Autocomplete
      disablePortal
      options={props.options}
      onChange={onChangeOption}
      isOptionEqualToValue={(a, b) => a.value === b.value}
      renderInput={(params) => <TextField {...params} label={props.label} />}
    />
  );
}
