// The @ts-ignore rejects the error from having the .tsx file extension on import
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@mui/material";

import SearchableDropdown from "./SearchableDropdown";
import DeleteableInput from "./DeleteableInput";
import ErrorPopup from "./ErrorPopup";
import ImportPopup from "./ImportPopup";
import { setUserMajor } from "../services/user";
import { majorList } from "../services/academic";

// Input page is the page where the user inputs all of their information
export default function InputPage(props: {
  majorDisplayList: any[];
  concentrationList: any[];
  concentrationDisplayList: any[];
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
  const [major, setMajor] = useState<number | undefined>(); // major that is selected
  const [concentration, setConcentration] = useState<number | undefined>(); // concentration that is selected
  const [fourYearPlan, setFourYearPlan] = useState(false);
  const [canMoveOn, setCanMoveOn] = useState(false); // whether the user is ready to move on

  function updateMoveOn(): void {
    if (major !== undefined && concentration !== undefined) {
      setCanMoveOn(true);
      setUserMajor({
        major,
        concentration,
        load_four_year_plan: fourYearPlan,
        completed_courses: []
      });
    } else {
      setUserMajor(undefined);
    }
  }

  const [coursesTaken, setCoursesTaken] = useState<number[]>([]);

  /*
  Methods for updating the table of previously taken courses
*/
  const [selectedAcronym, setSelectedAcronym] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);

  // When a new subject is selected, reset the selected number back to null
  useEffect(() => {
    setSelectedNumber(null);
  }, [selectedAcronym]);

  function selectedCourseSubjectAcronym(_selectedAcronym: any): void {
    setSelectedAcronym(_selectedAcronym);

    // The updates the selected course acronym in App.js
    props.setSelectedCourseSubject(_selectedAcronym);
  }

  function selectedCourseNumber(_selectedNumber: any): void {
    setSelectedNumber(_selectedNumber);
  }

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
  const [uploaderVisibility, setUploaderVisibility] = useState(false);
  const popupCloseHandlerUp = (): void => {
    setUploaderVisibility(false);
  };
  // Makes the uploader popup visible
  function showUploader(): void {
    setUploaderVisibility(true);
  }
  // This method handles adding a new taken course to the table
  function processCompletedCourse(): void {
    if (selectedNumber != null && selectedAcronym != null) {
      // TODO Check that the course is a valid course in the database
      if (!coursesTaken.includes(`${selectedAcronym}-${selectedNumber}`)) {
        // Add the course to the completed course list
        console.log(`Adding course ${selectedAcronym}-${selectedNumber}`);
        setCoursesTaken(
          coursesTaken.concat(`${selectedAcronym}-${selectedNumber}`)
        );
        props.setTakenCourses(
          coursesTaken.concat(`${selectedAcronym}-${selectedNumber}`)
        );
      } else {
        throwError("This course has already been added");
      }
    } else {
      if (selectedNumber == null) {
        throwError(
          "No course number has been selected, please select a course number."
        );
      } else {
        throwError(
          "No course type has been selected, please select a course type before adding a course."
        );
      }
    }
    console.log(`Adding course ${selectedAcronym}-${selectedNumber}`);
    // setCoursesTaken(
    //  coursesTaken.concat(selectedAcronym + "-" + selectedNumber)
    // );
    // props.setTakenCourses(
    //   coursesTaken.concat(selectedAcronym + "-" + selectedNumber)
    // );
  }

  // Removes the course from the coursesTaken list
  function removeCourse(course: number): void {
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

  const concentrationList = majorList().find(
    (a) => a.id === major
  )?.concentrations;

  // Function to autopopulate completed courses list. with every course.
  return (
    <div className="App">
      <div data-testid="content">
        <header className="Four-Year-Plan">
          <h1>Academic Planner</h1>
        </header>
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
        <div className="screen">
          <div className="input-grid">
            <div className="input-grid-dropdown" data-testid="MajorDropDown">
              <SearchableDropdown
                options={majorList().map((m) => ({
                  label: m.name,
                  value: m.id
                }))}
                label="Major"
                onSelectOption={(m?: number) => {
                  setMajor(m);
                  updateMoveOn();
                }}
              />
            </div>
            <div className="input-grid-dropdown">
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
            </div>
            <div className="input-grid-item">
              <div className="courseDropdowns">
                <SearchableDropdown
                  options={props.courseSubjectAcronyms}
                  label="Course Subject"
                  onSelectOption={selectedCourseSubjectAcronym}
                  showDropdown={true}
                  thin={true}
                />
                <SearchableDropdown
                  options={props.courseSubjectNumbers}
                  label="Course Number"
                  onSelectOption={selectedCourseNumber}
                  showDropdown={selectedAcronym}
                  thin={true}
                />
              </div>
              <Button onClick={processCompletedCourse}>Add Course</Button>
            </div>
            <div className="input-grid-item">
              {
                // <Button onClick={setupUploader} data-testid="Import">
                //   Import Schedule
                // </Button>
              }
            </div>
            <div className="input-grid-item">
              <Link href="/scheduler">
                <Button disabled={canMoveOn}>Generate Schedule</Button>
              </Link>
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
            </div>
            <div className="input-grid-item-courses">
              <div className="completedCourses">
                <h2>Completed Courses</h2>
                <div
                  className="courseList"
                  style={{
                    gridTemplateColumns: `repeat(${
                      // This may be where issue is with dropdown columns/formatting.
                      (coursesTaken.length - 1) / 10 + 1
                    }, 1fr)`
                  }}
                >
                  {coursesTaken.map((course) => {
                    return (
                      <div key={course} onClick={() => removeCourse(course)}>
                        <DeleteableInput
                          text={course}
                          thinWidth={coursesTaken.length >= 20}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
