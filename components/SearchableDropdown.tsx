import { Autocomplete, TextField } from "@mui/material";
import React from "react";

// Note: drop down often key-value pair behind scenes.
export default function SearchableDropdown(props: {
  options: Array<string>;
  label: string;
  onSelectOption: (option: any) => void;
}): JSX.Element {
  const [value, setValue] = React.useState<any>(null);
  return (
    <div>
      <Autocomplete
        value={value}
        disablePortal
        options={props.options}
        onChange={(event: any, newValue: any) => {
          setValue(newValue);
          props.onSelectOption(newValue);
        }}
        sx={{ width: "75%", pt: 6, pl: 3, textAlign: "center" }}
        renderInput={(params) => <TextField {...params} label={props.label} />}
      />
    </div>
  );
}
