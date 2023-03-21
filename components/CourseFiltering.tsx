import React, { useEffect, useState } from "react";
import { CourseType } from "../entities/four_year_plan";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { extractCategories } from "../services/academic";
import SearchableDropdown from "./SearchableDropdown";
import {
  Grid
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

  const coursesByCategory = (category: string | undefined): void => {
    if (category !== undefined) {
      const courses: CourseType[] =
        props.courseData.filter((course: CourseType) => {
          return course.category === category;
        });
      props.onFiltered(courses);
    }
  };

  const courseBySubject = (): void => {
    if (filterCourseSubject !== undefined) {
      const courses: CourseType[] =
        props.courseData.filter((course: CourseType) => {
          return course.subject === filterCourseSubject;
        });
      props.onFiltered(courses);
    }
  };

  const courseByNumber = (): void => {
    if (filterCourseNumber !== undefined) {
      const courses: CourseType[] =
        props.courseData.filter((course: CourseType) => {
          // A bit more useful than a direct comparison
          return course.number.includes(filterCourseNumber);
        });
      props.onFiltered(courses);
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
      props.onFiltered(courses);
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

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleTabChange} aria-label="filter tab options" centered>
          <Tab label="By Category" {...a11yProps(0)} />
          <Tab label="By Subject/Number" {...a11yProps(1)} />
          <Tab label="By Credit" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <SearchableDropdown
          options={extractCategories(props.courseData)}
          label={"Category"}
          onSelectOption={coursesByCategory}
          sx={{
            maxWidth: "unset",
            pt: "unset",
            pl: "unset"
          }}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
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
              label={"Subject"}
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
                label={"Number"}
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
      <TabPanel value={value} index={2}>
        By Credit
      </TabPanel>
    </Box>
  );
}
