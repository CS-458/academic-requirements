import { Select } from "@mui/material";
import React /* { useEffect, useState } */ from "react"; // added useEffect, useState portion.
import "./SearchableDropdown.css";
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
    option: SingleValue<{ label: string; value: string }>
  ): void {
    console.log(`Selected Option: ${option.value}`);
    props.onSelectOption(option.label);
  }
  /*
//This is a copy of the major fetch statement added from Apps.js. It is here
  //to provide a template of what is needed to get data from the database for the category dropdown.
  // Gets the majors from the database, runs on start-up
  useEffect(() => {
    fetch("/major") // create similar
      .then((res) => res.json())
      .then((result) => {
        // Sets majorData to result from database query
        setMajorData(result);
        // Gets the 'name' of the major objects
        let temp = [];
        result.forEach((x) => {
          temp.push(x.name);
        });
        // Sets majorDisplayData to the 'name' of the majors
        setMajorDisplayData(temp);
      });
  }, []);
  */
  return (
    <div className={props.thin ? "thinContainer" : "container"}>
      {/* Text that labels the search box */}
      <div
        className={props.thin ? "thinLabel" : "label"}
        data-testid="searchableDropdownLabel"
      >
        {props.label}
      </div>
      {/* Dropdown box */}
      {props.showDropdown && (
        <Select
          options={props.options?.map((opt) => ({ label: opt, value: opt }))}
          onChange={onChangeOption}
        />
      )}
    </div>
  );
  // TODO: Select element
};
// create fetch statement somewhere
export default SearchableDropdown;
