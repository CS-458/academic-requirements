import { Autocomplete, Select, TextField } from "@mui/material";
import React /* { useEffect, useState } */ from "react"; // added useEffect, useState portion.
// Below majorInfo added as part of template for database connection.
// majorData is an array of major objects returned from the database
// const [majorData, setMajorData] = useState([]);

// majorDisplayData is an array of the 'name' of the major objects for display purposes
// const [majorDisplayData, setMajorDisplayData] = useState([]);

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
      renderInput={(params) => <TextField {...params} label={props.label} />}
    />
  );
  // TODO: Select element
}
