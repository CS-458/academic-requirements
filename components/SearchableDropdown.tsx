import { Autocomplete, SxProps, TextField } from "@mui/material";
import React from "react";

// Note: drop down often key-value pair behind scenes.
export default function SearchableDropdown<T>(props: {
  options: Array<{ label: string; value: T } | T>;
  label: string | null;
  disabled?: boolean;
  // freeSolo allows the user to type whatever they want (see docs for MUI autocomplete)
  // it works with onInputChange
  freeSolo?: boolean;
  onInputChange?: (value: string) => void;
  onSelectOption: (option?: T) => void;
  sx?: SxProps;
}): JSX.Element {
  return (
    <Autocomplete
      disablePortal
      disabled={props.disabled === true}
      freeSolo={props.freeSolo === true}
      onInputChange={(_a, value) => {
        if (props.onInputChange !== undefined) {
          props.onInputChange(value);
        }
      }}
      autoHighlight
      options={props.options.map((v) => {
        if (
          typeof v === "object" &&
          v != null &&
          "label" in v &&
          "value" in v
        ) {
          return v;
        } else {
          return {
            label: `${v}`,
            value: v
          };
        }
      })}
      onChange={(_a, value) => {
        if (typeof value !== "string") {
          props.onSelectOption(value?.value);
        }
      }}
      sx={{
        "& .MuiAutocomplete-inputRoot": { paddingRight: "10px!important" },
        width: "100%",
        maxWidth: 400,
        pt: 6,
        pl: 3,
        textAlign: "center",
        ...props.sx // sx styles from props will override the defaults
      }}
      isOptionEqualToValue={(a, b) => a.value === b.value}
      renderInput={(params) => <TextField {...params} label={props.label} />}
    />
  );
}
