import React, { useEffect, useState } from "react";
import { CourseType } from "../entities/four_year_plan";

import { extractCategories } from "../services/academic";
import SearchableDropdown from "./SearchableDropdown";
import {
  Tabs, Tab, Box, Grid, TextField
} from "@mui/material";

interface CourseFilteringProps {
  courseData: CourseType[],
  onFiltered: (courses: CourseType[]) => void
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function a11yProps(index: number): any {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`
  };
}

function TabPanel(props: TabPanelProps): any {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function CourseFiltering(props: CourseFilteringProps): JSX.Element {
  const [value, setValue] = useState(0);

  const [filterCourseSubject, setFilterCourseSubject] = useState<string>();
  const [filterCourseNumber, setFilterCourseNumber] = useState<string>();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setValue(newValue);
  };

  const sendFilteredCourses = (courses: CourseType[]): void => {
    // Duplicates can exist because the same course belongs to multiple categories
    // Remove duplicates before sending
    const arr = courses.filter((course1, index) =>
      index === courses.findIndex(course2 => course1.idCourse === course2.idCourse)
    );
    props.onFiltered(arr);
  };

  const setFilterCourseName = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.value === "") {
      sendFilteredCourses([]);
      return;
    }
    const courses: CourseType[] =
      props.courseData.filter((course: CourseType) => {
        return course.name.toLowerCase().includes(event.target.value.toLowerCase());
      });
    sendFilteredCourses(courses);
  };

  const coursesByCategory = (category: string | undefined): void => {
    if (category !== undefined) {
      const courses: CourseType[] =
        props.courseData.filter((course: CourseType) => {
          return course.category === category;
        });
      sendFilteredCourses(courses);
    }
  };

  const courseBySubject = (): void => {
    if (filterCourseSubject !== undefined) {
      const courses: CourseType[] =
        props.courseData.filter((course: CourseType) => {
          return course.subject === filterCourseSubject;
        });
      sendFilteredCourses(courses);
    }
  };

  const courseByNumber = (): void => {
    if (filterCourseNumber !== undefined) {
      const courses: CourseType[] =
        props.courseData.filter((course: CourseType) => {
          // A bit more useful than a direct comparison
          return course.number.includes(filterCourseNumber);
        });
      sendFilteredCourses(courses);
    }
  };

  const coursesBySubjectNumber = (): void => {
    // more complex
    if (filterCourseSubject !== undefined && filterCourseNumber !== undefined) {
      const courses: CourseType[] =
        props.courseData.filter((course: CourseType) => {
          // A bit more useful than a direct comparison
          return (
            course.subject === filterCourseSubject &&
            course.number.includes(filterCourseNumber)
          );
        });
      sendFilteredCourses(courses);
    }
  };

  useEffect(() => {
    // logic for filtering by subject, number, both, or neither
    if (filterCourseSubject === undefined &&
        (filterCourseNumber === undefined || filterCourseNumber === "")) {
      props.onFiltered([]); // clear the results
      return;
    }

    // Search using both if both are provided
    if (filterCourseSubject !== undefined && filterCourseNumber !== undefined) {
      return coursesBySubjectNumber();
    }

    if (filterCourseSubject !== undefined) { return courseBySubject(); }
    if (filterCourseNumber !== undefined) { return courseByNumber(); }
  }, [filterCourseSubject, filterCourseNumber]);

  const setFilterCredit = (credits: string | undefined): void => {
    if (credits !== undefined) {
      const courses: CourseType[] =
        props.courseData.filter((course: CourseType) => {
          return course.credits.toString() === credits;
        });
      sendFilteredCourses(courses);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value}
              onChange={handleTabChange}
              aria-label="filter tab options"
              variant="scrollable"
              scrollButtons="auto">
          <Tab label="Category"
               data-testid="category-tab"
               {...a11yProps(0)} />
          <Tab label="Subject/Number"
               data-testid="subjectnumber-tab"
               {...a11yProps(1)} />
          <Tab label="Name"
               data-testid="name-tab"
               {...a11yProps(2)} />
          <Tab label="Credit"
               data-testid="credit-tab"
               {...a11yProps(3)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0} data-testid="category-panel">
        <SearchableDropdown
          options={extractCategories(props.courseData)}
          label={"Course Category"}
          onSelectOption={coursesByCategory}
          sx={{
            maxWidth: "unset",
            pt: "unset",
            pl: "unset"
          }}
        />
      </TabPanel>
      <TabPanel value={value} index={1} data-testid="subjectnumber-panel">
        <Grid container spacing={2} columns={2}>
          <Grid item xs={1}>
            <SearchableDropdown
              /*
                Get all subjects from supplied course data by mapping
                Add the result of the map to a Set (to remove duplicates)
                Convert set to an array
                Sort the array (alphabetically)
              */
              options={ Array.from(new Set(props.courseData.map(c => c.subject))).sort() }
              label={"Course Subject"}
              onSelectOption={setFilterCourseSubject}
              sx={{
                maxWidth: "unset",
                pt: "unset",
                pl: "unset"
              }}
            />
          </Grid>
          <Grid item xs={1}>
            <SearchableDropdown
                options={ Array.from(new Set(props.courseData.filter(c => c.subject === filterCourseSubject).map(c => c.number))).sort() }
                label={"Course Number"}
                onSelectOption={setFilterCourseNumber}
                onInputChange={setFilterCourseNumber}
                sx={{
                  maxWidth: "unset",
                  pt: "unset",
                  pl: "unset"
                }}
                freeSolo = {true}
              />
          </Grid>
        </Grid>
      </TabPanel>
      <TabPanel value={value} index={2} data-testid="name-panel">
        <TextField
          label={"Course Name"}
          onChange={setFilterCourseName}
          sx={{
            width: "100%"
          }}
        />
      </TabPanel>
      <TabPanel value={value} index={3} data-testid="credit-panel">
        {/* A slider may be better for credit ranges */}
        <SearchableDropdown
            options={ Array.from(new Set(props.courseData.map(c => c.credits.toString()))).sort() }
            label={"Course Credits"}
            onSelectOption={setFilterCredit}
            onInputChange={setFilterCredit}
            sx={{
              maxWidth: "unset",
              pt: "unset",
              pl: "unset"
            }}
            freeSolo = {true}
          />
      </TabPanel>
    </Box>
  );
}
