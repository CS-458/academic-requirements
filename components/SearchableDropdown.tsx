import { Autocomplete, Select, TextField } from "@mui/material";
import React /* { useEffect, useState } */ from "react"; // added useEffect, useState portion.
// Below majorInfo added as part of template for database connection.
// majorData is an array of major objects returned from the database
// const [majorData, setMajorData] = useState([]);

// majorDisplayData is an array of the 'name' of the major objects for display purposes
// const [majorDisplayData, setMajorDisplayData] = useState([]);

// Note: drop down often key-value pair behind scenes.
const SearchableDropdown = (props: {
  options: string[];
  label: string;
  onSelectOption: (option: string) => void;
  showDropdown: boolean;
  thin: boolean;
}): JSX.Element => {
  // Runs a debug message with the selected major
  // and passes the name of the selected class to onSelectOption
  function onChangeOption(
    _a: any,
    option: { label: string; value: string } | null
  ): void {
    if (option !== null) {
      console.log(`Selected Option: ${option.value}`);
      props.onSelectOption(option.label);
    }
  }
  return (
    <>
      {props.showDropdown && (
        <Autocomplete
          disablePortal
          options={props.options?.map((opt) => ({ label: opt, value: opt }))}
          onChange={onChangeOption}
          renderInput={(params) => (
            <TextField {...params} label={props.label} />
          )}
        />
      )}
    </>
  );
  // TODO: Select element
};
// create fetch statement somewhere
export default SearchableDropdown;
