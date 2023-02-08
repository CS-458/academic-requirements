// The @ts-ignore rejects the error from having the .tsx file extension on import
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@mui/material";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import SearchableDropdown from "./SearchableDropdown";
import DeleteableInput from "./DeleteableInput";
import ErrorPopup from "./ErrorPopup";
// import ImportPopup from "./ImportPopup";
import { setUserMajor } from "../services/user";
import { majorList } from "../services/academic";

// Input page is the page where the user inputs all of their information
export default function InputPage(props: {
  majorList: any[];
  concentrationList: any[];
  concentrationHasFourYearPlan: boolean;
  importData: (data: any) => void;

  courseSubjectAcronyms: string[];
  setSelectedCourseSubject: (subject: string) => void;
  courseSubjectNumbers: string[];

  takenCourses: string[];
  setTakenCourses: (courses: string[]) => void;
  onClickMajor: (major: string) => void;
  onClickConcentration: (concentration: string) => void;
  onClickGenerate: (
    major: string,
    concentration: string,
    previousCourses: string[]
  ) => void;
  setUseFourYearPlan: (usePlan: boolean) => void;
}): JSX.Element {
  // TODO make sure all of this information being passed is filled in and valid

  /*
  General variables
  */
  const [major, setMajor] = useState<string | undefined>(); // major that is selected
  const [concentration, setConcentration] = useState<string | null>(); // concentration that is selected
  const [fourYearPlan, setFourYearPlan] = useState(false);
  const [canMoveOn, setCanMoveOn] = useState(false); // whether the user is ready to move on

  function updateMoveOn(): void {
    if (major !== undefined && concentration !== undefined) {
      setCanMoveOn(true);
      setUserMajor({
        major,
        concentration,
        load_four_year_plan: fourYearPlan,
        completed_courses: coursesTaken
      });
    } else {
      setCanMoveOn(false);
      setUserMajor(undefined);
    }
  }

  const [coursesTaken, setCoursesTaken] = useState<string[]>([]);

  // Methods for updating the table of previously taken courses
  const [selectedAcronym, setSelectedAcronym] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);

  // When a new subject is selected, reset the selected number back to null
  useEffect(() => {
    setSelectedNumber(null);
  }, [selectedAcronym]);

  const [visibility, setVisibility] = useState(false);
  const popupCloseHandler = (): void => {
    setVisibility(false);
  };
  const [error, setError] = useState("");
  function throwError(error: any): void {
    setVisibility(true);
    setError(error);
  }

  // closes the uploader popup
  // const [uploaderVisibility, setUploaderVisibility] = useState(false);
  const popupCloseHandlerUp = (): void => {
    setUploaderVisibility(false);
  };
  // Makes the uploader popup visible
  // function showUploader(): void {
  //   setUploaderVisibility(true);
  // }
  // This method handles adding a new taken course to the table
  function processCompletedCourse(): void {
    if (selectedNumber != null && selectedAcronym != null) {
      // TODO Check that the course is a valid course in the database
      // if (!coursesTaken.includes(`${selectedAcronym}-${selectedNumber}`)) {
      // Add the course to the completed course list
      console.log(`Adding course ${selectedAcronym}-${selectedNumber}`);
      setCoursesTaken(
        coursesTaken.concat(`${selectedAcronym}-${selectedNumber}`)
      );
      props.setTakenCourses(
        coursesTaken.concat(`${selectedAcronym}-${selectedNumber}`)
      );
    //   } else {
    //     throwError("This course has already been added");
    //   }
    // } else {
    //   if (selectedNumber == null) {
    //     throwError(
    //       "No course number has been selected, please select a course number."
    //     );
    //   } else {
    //     throwError(
    //       "No course type has been selected, please select a course type before adding a course."
    //     );
    //   }
    }
    console.log(`Adding course ${selectedAcronym}-${selectedNumber}`);
  }

  // Removes the course from the coursesTaken list
  function removeCourse(course: string): void {
    // Slice method did not work, so here's a replacement:
    const arr: any[] = [];
    const index = coursesTaken.findIndex((x) => x === course);
    coursesTaken.forEach((x, y) => {
      if (y !== index) {
        arr.push(x);
      }
    });
    setCoursesTaken(arr);
    props.setTakenCourses(arr);
    console.log(`Deleted course: ${course}`);
  }
  console.log(major);
  const concentrationList = majorList()
    .data?.find((a) => a.name === major)
    ?.concentrations.map((a: any) => (a.name));
  console.log(concentration);
  // Function to autopopulate completed courses list. with every course.
  return (
    <div className="App">
      <ErrorPopup
        onClose={popupCloseHandler}
        show={visibility}
        title="Error"
        error={error}
      />
      {
        // <ImportPopup
        //   title="Upload"
        //   show={uploaderVisibility}
        //   onClose={popupCloseHandlerUp}
        //   returnData={setImportData}
        // />
      }
      <Grid container spacing={3} pt={5}>
        <Grid sm={5}>
          <SearchableDropdown
            options={majorList().data?.map((m) => (m.name)) ?? []}
            label="Major"
            onSelectOption={(m?: string) => {
              setMajor(m);
              updateMoveOn();
            }}
          />
          {concentrationList !== undefined && (
          <SearchableDropdown
            options={concentrationList}
            label="Concentration"
            onSelectOption={(m?: number) => {
              setConcentration(m);
              updateMoveOn();
            }}
          />
          )}
          <Link href="/scheduler">
            <Button disabled={concentration === null}>Generate Schedule</Button>
          </Link>
        </Grid>
        <Grid sm={4}>
          <SearchableDropdown
            options={props.courseSubjectAcronyms}
            label="Course Subject"
            onSelectOption={setSelectedAcronym}
          />
           <SearchableDropdown
            options={["123", "456", "789"].map((n) => ({ label: n, value: n }))}
            label="Course Number"
            onSelectOption={setSelectedNumber}
          />
          <Button onClick={processCompletedCourse}>Add Course</Button>
        </Grid>
        <Grid sm={3}>
          {coursesTaken.length !== 0 && (
            <Paper elevation={5}>
              <h2>Completed Courses</h2>
              <DeleteableInput
                courses={coursesTaken}
                deleteCourse={removeCourse}
              />
            </Paper>
          )}
        </Grid>
      {
        // <Button onClick={setupUploader} data-testid="Import">
        //   Import Schedule
        // </Button>
      }

      <br />
      {
        props.concentrationHasFourYearPlan && <></>
        // <div style={{ fontSize: "1em", margin: "10px" }}>
        //   <input
        //     id="fourYearPlan"
        //     type="checkbox"
        //     onChange={handleUseFourYearPlan}
        //   />
        //   <label
        //     htmlFor="fourYearPlan"
        //     data-testid="fourYearPlanCheckbox"
        //   >
        //     Load a four year plan?
        //   </label>
        // </div>
      }

      </Grid>
    </div>
  );
}
