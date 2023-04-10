import React, { useEffect, useState } from "react";
import { CourseType } from "../entities/four_year_plan";

import { extractCategories } from "../services/academic";
import SearchableDropdown from "./SearchableDropdown";
import {
  Tabs, Tab, Box, Grid, TextField
} from "@mui/material";

interface CourseFilteringProps {
  courseData: CourseType[], // The Courses to be filtered
  onFiltered: (courses: CourseType[]) => void // Send filtered courses to this function
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

  const [courseSubjectFilter, setCourseSubjectFilter] = useState<string>();
  const [courseNumberFilter, setCourseNumberFilter] = useState<string>();

  // Handle transition between filter options
  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setValue(newValue);
    // Reset states on tab change
    setCourseSubjectFilter(undefined);
    setCourseNumberFilter(undefined);
  };

  const sendFilteredCourses = (courses: CourseType[]): void => {
    // Duplicates can exist because the same course belongs to multiple categories
    // Remove duplicates before sending
    const arr = courses.filter((course1, index) => {
      // Only keep courses if it's current index is the first instance of that ID
      return index === courses.findIndex(course2 => course1.idCourse === course2.idCourse);
    });
    props.onFiltered(arr);
  };

  // Filter based on the name
  const setFilterCourseName = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.value === "") {
      // If no name if provided, clear the filtered array
      sendFilteredCourses([]);
      return;
    }
    const courses: CourseType[] =
      props.courseData.filter((course: CourseType) => {
        // Convert everything to lowercase to ignore letter case
        // Using .includes() offers better results than pure equality
        return course.name.toLowerCase().includes(event.target.value.toLowerCase());
      });
    sendFilteredCourses(courses);
  };

  // Filter based on the category
  const filterByCategory = (category: string | undefined): void => {
    if (category !== undefined) {
      const courses: CourseType[] =
        props.courseData.filter((course: CourseType) => {
          // Category name is not user entered, it should match exactly
          return course.category === category;
        });
      sendFilteredCourses(courses);
    }
  };

  // Filter by subject (CS, BIO, etc.)
  const filterBySubject = (): void => {
    if (courseSubjectFilter !== undefined) {
      const courses: CourseType[] =
        props.courseData.filter((course: CourseType) => {
          // Subject is not user entered, it should match exactly
          return course.subject === courseSubjectFilter;
        });
      sendFilteredCourses(courses);
    }
  };

  // FIlter by number (101, 404, etc.)
  const filterByNumber = (): void => {
    if (courseNumberFilter !== undefined) {
      const courses: CourseType[] =
        props.courseData.filter((course: CourseType) => {
          // A bit more useful than a direct comparison
          // Using .includes() offers better results than pure equality
          return course.number.includes(courseNumberFilter);
        });
      sendFilteredCourses(courses);
    }
  };

  // Filter by a subject and a number
  const filterBySubjectNumber = (): void => {
    // more complex
    if (courseSubjectFilter !== undefined && courseNumberFilter !== undefined) {
      const courses: CourseType[] =
        props.courseData.filter((course: CourseType) => {
          // Combination of filterBySubject & filterByNumber
          return (
            course.subject === courseSubjectFilter &&
            course.number.includes(courseNumberFilter)
          );
        });
      sendFilteredCourses(courses);
    }
  };

  // Logic for filtering by subject, number, both, or neither
  useEffect(() => {
    if (courseSubjectFilter === undefined &&
        (courseNumberFilter === undefined || courseNumberFilter === "")) {
      props.onFiltered([]); // clear the results
      return;
    }

    // Search using both if both are provided
    if (courseSubjectFilter !== undefined && courseNumberFilter !== undefined) {
      return filterBySubjectNumber();
    }

    if (courseSubjectFilter !== undefined) { return filterBySubject(); }
    if (courseNumberFilter !== undefined) { return filterByNumber(); }
  }, [courseSubjectFilter, courseNumberFilter]);

  // Filter by  credit value
  const filterByCredit = (credits: string | undefined): void => {
    if (credits !== undefined) {
      const courses: CourseType[] =
        props.courseData.filter((course: CourseType) => {
          // Convert to string because SearchableDropdown return a string
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
          onSelectOption={filterByCategory}
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
              onSelectOption={setCourseSubjectFilter}
              sx={{
                maxWidth: "unset",
                pt: "unset",
                pl: "unset"
              }}
            />
          </Grid>
          <Grid item xs={1}>
            <SearchableDropdown
                options={ Array.from(new Set(props.courseData.filter(c => c.subject === courseSubjectFilter).map(c => c.number))).sort() }
                label={"Course Number"}
                onSelectOption={setCourseNumberFilter}
                onInputChange={setCourseNumberFilter}
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
            onSelectOption={filterByCredit}
            onInputChange={filterByCredit}
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
