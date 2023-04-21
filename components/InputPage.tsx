import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Button,
  Typography,
  Grid,
  Paper,
  Snackbar,
  Switch,
  FormControlLabel,
  AlertProps,
  Alert,
  Box
} from "@mui/material";
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
export default function InputPage(): JSX.Element {
  /*
  General variables
  */
  const [major, setMajor] = useState<MajorType>(); // major that is selected
  const [concentration, setConcentration] = useState<ConcentrationType>(); // concentration that is selected
  const [usePlan, setUsePlan] = useState(false);
  const [completedCourses, setCompletedCourses] = useState<string[]>([]); // completed courses added to the list
  const [canMoveOn, setCanMoveOn] = useState(false); // whether the user is ready to move on

  // Methods for updating the table of previously taken courses
  const [selectedAcronym, setSelectedAcronym] = useState<string | undefined>();
  const [selectedNumber, setSelectedNumber] = useState<string | undefined>();

  // Used for clearing the displayed text in the dropdown components
  const [resetConcentration, setResetConcentration] = useState(0);
  const [resetNumber, setResetNumber] = useState(0);

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

  const CustomAlert = React.forwardRef<HTMLDivElement, AlertProps>(function CustomAlert(
    props,
    ref
  ) {
    return <Alert elevation={6} ref={ref} variant="filled" {...props} />;
  });
  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ): void => {
    if (reason === "clickaway") {
      return;
    }
    setVisibility(false);
  };

  // This method handles adding a new taken course to the table
  function processCompletedCourse(): void {
    if (selectedNumber !== undefined && selectedAcronym !== undefined) {
      if (!completedCourses.includes(`${selectedAcronym}-${selectedNumber}`)) {
        // Add the course to the completed course list
        console.log(`Adding course ${selectedAcronym}-${selectedNumber}`);
        setCompletedCourses(
          completedCourses.concat(`${selectedAcronym}-${selectedNumber}`)
        );
      } else {
        throwError("This course has already been added", "error");
      }
    }
    setResetNumber(resetNumber + 1);
    setSelectedNumber(undefined);
  }

  // Removes the course from the completedCourses list
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

  return (
    <div className="App">
      <Snackbar
        open={visibility}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        data-testid="error"
      >
        <CustomAlert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {`${error}`}
        </CustomAlert>
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
                setResetConcentration(resetConcentration + 1);
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
          <Box textAlign={"center"}>
            {concentration?.fourYearPlan != null && (
              <FormControlLabel
                control={
                  <Switch
                    onChange={handleUseFourYearPlan}
                    inputProps={{ "aria-label": "controlled" }}
                    data-testid="FourYearPlanSwitch"
                  />
                }
                label="Use Suggested Four Year Plan"
              />
            )}
            <br />
            <Link href="/scheduler">
              <Button disabled={!canMoveOn}>Generate Schedule</Button>
            </Link>
          </Box>
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
              setResetNumber(resetNumber + 1);
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
            <Button
              disabled={selectedNumber === undefined}
              onClick={processCompletedCourse}
            >
              Add Course
            </Button>
          </div>
        </Grid>
        <Grid container item sm={4} flexDirection="column" alignItems="center">
          <Paper
            elevation={5}
            sx={{ width: "100%", minHeight: "10em", paddingY: "1em" }}
          >
            <Typography variant="h6" component="div">
              Courses Marked Complete
            </Typography>
            <DeleteableInput
              courses={completedCourses}
              deleteCourse={removeCourse}
            />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
