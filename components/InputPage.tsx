import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import SearchableDropdown from "./SearchableDropdown";
import DeleteableInput from "./DeleteableInput";
// import ImportPopup from "./ImportPopup";
import { setUserMajor } from "../services/user";
import {
  majorList,
  concentrationList,
  courseNumbers,
  courseSubjects
} from "../services/academic";
import { ConcentrationType, MajorType } from "../entities/four_year_plan";
// Input page is the page where the user inputs all of their information
export default function InputPage(props: {
  // majorList: any[];
  // concentrationList: any[];
  // concentrationHasFourYearPlan: boolean;
  importData: (data: any) => void;
  // setSelectedCourseSubject: (subject: string) => void;
  // takenCourses: string[];
  // setTakenCourses: (courses: string[]) => void;
  // onClickMajor: (major: string) => void;
  // onClickConcentration: (concentration: string) => void;
  // onClickGenerate: (
  //   major: string,
  //   concentration: string,
  //   previousCourses: string[]
  // ) => void;
  // setUseFourYearPlan: (usePlan: boolean) => void;
}): JSX.Element {
  // TODO make sure all of this information being passed is filled in and valid

  /*
  General variables
  */
  const [major, setMajor] = useState<
  { name: string; id: number } | undefined
  >(); // major that is selected
  const [concentration, setConcentration] = useState<{
    name: string;
    id: number;
    fourYearPlan: string | null;
  }>(); // concentration that is selected
  const [usePlan, setUsePlan] = useState(false);
  const [completedCourses, setCompletedCourses] = useState<string[]>([]); // completed courses added to the list
  const [canMoveOn, setCanMoveOn] = useState(false); // whether the user is ready to move on

  // Methods for updating the table of previously taken courses
  const [selectedAcronym, setSelectedAcronym] = useState<string | undefined>();
  const [selectedNumber, setSelectedNumber] = useState<string | undefined>();

  // Used for clearing the displayed text in the dropdown components
  const [resetConcentration, setResetConcentration] = useState(false);
  const [resetNumber, setResetNumber] = useState(false);

  // When a new subject is selected, reset the selected number back to null
  useEffect(() => {
    setSelectedNumber(undefined);
  }, [selectedAcronym]);

  // Variables for controlling error throwing
  const [visibility, setVisibility] = useState(false);
  const [severity, setSeverity] = useState<any>(undefined);
  const [error, setError] = useState("");
  // Severity should be error, warning, info, or success
  function throwError(error: string, errorSeverity: string): void {
    setVisibility(true);
    setError(error);
    setSeverity(errorSeverity);
  }

  const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref
  ) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });
  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setVisibility(false);
  };

  // closes the uploader popup
  // const [uploaderVisibility, setUploaderVisibility] = useState(false);
  // const popupCloseHandlerUp = (): void => {
  //   setUploaderVisibility(false);
  // };
  // Makes the uploader popup visible
  // function showUploader(): void {
  //   setUploaderVisibility(true);
  // }

  // This method handles adding a new taken course to the table
  function processCompletedCourse(): void {
    setResetNumber(!resetNumber);
    if (selectedNumber != null && selectedAcronym != null) {
      // TODO Check that the course is a valid course in the database
      if (!completedCourses.includes(`${selectedAcronym}-${selectedNumber}`)) {
        // Add the course to the completed course list
        console.log(`Adding course ${selectedAcronym}-${selectedNumber}`);
        setCompletedCourses(
          completedCourses.concat(`${selectedAcronym}-${selectedNumber}`)
        );
        // props.setTakenCourses(
        //   completedCourses.concat(`${selectedAcronym}-${selectedNumber}`)
        // );
      } else {
        throwError("This course has already been added", "error");
      }
    } else {
      if (selectedNumber == null) {
        throwError(
          "No course number has been selected, please select a course number.",
          "error"
        );
      } else {
        throwError(
          "No course type has been selected, please select a course type before adding a course.",
          "error"
        );
      }
    }
  }

  // Removes the course from the coursesTaken list
  function removeCourse(course: string): void {
    // Slice method did not work, so here's a replacement:
    const arr: any[] = [];
    const index = completedCourses.findIndex((x) => x === course);
    completedCourses.forEach((x, y) => {
      if (y !== index) {
        arr.push(x);
      }
    });
    setCompletedCourses(arr);
    //props.setTakenCourses(arr);
    console.log(`Deleted course: ${course}`);
  }

  const concentrationListValue =
    concentrationList(major?.id).data?.map((c) => ({
      label: c.name,
      value: c
    })) ?? [];

  function handleUseFourYearPlan(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    if (event.target.checked) {
      if (major !== undefined && concentration !== undefined) {
        setUsePlan(true);
        setUserMajor({
          major,
          concentration,
          load_four_year_plan: true,
          completed_courses: completedCourses
        });
      }
    } else {
      if (major !== undefined && concentration !== undefined) {
        setUsePlan(false);
        setUserMajor({
          major,
          concentration,
          load_four_year_plan: false,
          completed_courses: completedCourses
        });
      }
    }
  }

  // This updates the completed courses that will be sent to the next page
  useEffect(() => {
    if (major !== undefined && concentration !== undefined) {
      setUserMajor({
        major,
        concentration,
        load_four_year_plan: usePlan,
        completed_courses: completedCourses
      });
    }
  }, [completedCourses]);

  // force sets using a four year plan to false if their is no plan
  useEffect(() => {
    if (concentration?.fourYearPlan === null) {
      if (major !== undefined && concentration !== undefined) {
        setUsePlan(false);
        setUserMajor({
          major,
          concentration,
          load_four_year_plan: false,
          completed_courses: completedCourses
        });
      }
    }
  }, [concentration]);

  // Function to autopopulate completed courses list. with every course.
  return (
    <div className="App">
      <Snackbar
        open={visibility}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
      <Grid container spacing={3} pt={5}>
        <Grid container item sm={4} flexDirection="column" alignItems="center">
          <Typography variant="h6" component="div">
            Select Major
          </Typography>
          <SearchableDropdown
            options={
              majorList().data?.map(
                (m): { label: string; value: MajorType } => ({
                  label: m.name,
                  value: m
                })
              ) ?? []
            }
            label="Major"
            onSelectOption={(m) => {
              if (m !== major) {
                setMajor(m);
                setConcentration(undefined);
                setCanMoveOn(false);
                setUserMajor(undefined);
                setResetConcentration(!resetConcentration);
              }
            }}
          />
          <SearchableDropdown
            key={resetConcentration}
            disabled={concentrationListValue.length === 0}
            options={concentrationListValue}
            label="Concentration"
            onSelectOption={(m?: any) => {
              setConcentration(m);
              if (major !== undefined && m !== undefined) {
                setCanMoveOn(true);
                setUserMajor({
                  major,
                  concentration: m,
                  load_four_year_plan: usePlan,
                  completed_courses: completedCourses
                });
              }
            }}
          />
          <div>
            {concentration?.fourYearPlan != null && (
              <FormControlLabel
                control={
                  <Switch
                    onChange={handleUseFourYearPlan}
                    inputProps={{ "aria-label": "controlled" }}
                  />
                }
                label="Use Suggested Four Year Plan"
              />
            )}
            <br/>
            <Link href="/scheduler">
              <Button disabled={!canMoveOn}>Generate Schedule</Button>
            </Link>
          </div>
        </Grid>
        <Grid container item sm={4} flexDirection="column" alignItems="Center">
          <Typography variant="h6" component="div">
            Completed Courses
          </Typography>
          <SearchableDropdown
            options={
              courseSubjects().data?.map((s: string) => ({
                label: s,
                value: s
              })) ?? []
            }
            label="Course Subject"
            onSelectOption={(v) => {
              setSelectedAcronym(v);
              setResetNumber(!resetNumber);
            }}
          />
          <SearchableDropdown
            key={resetNumber}
            disabled={courseNumbers(selectedAcronym).data?.length === 0}
            options={
              courseNumbers(selectedAcronym).data?.map((s: string) => ({
                label: s,
                value: s
              })) ?? []
            }
            label="Course Number"
            onSelectOption={(a) => setSelectedNumber(a)}
          />
          <div>
            <Button onClick={processCompletedCourse}>Add Course</Button>
          </div>
        </Grid>
        <Grid container item sm={4} flexDirection="column" alignItems="center">
          <Paper
            elevation={5}
            sx={{ width: "100%", minHeight: "20em", paddingY: "1em" }}
          >
            <DeleteableInput
              courses={completedCourses}
              deleteCourse={removeCourse}
            />
          </Paper>
        </Grid>
        {
          // <ImportPopup
          //   title="Upload"
          //   show={uploaderVisibility}
          //   onClose={popupCloseHandlerUp}
          //   returnData={setImportData}
          // />
          // <Button onClick={setupUploader} data-testid="Import">
          //   Import Schedule
          // </Button>
        }
      </Grid>
    </div>
  );
}
