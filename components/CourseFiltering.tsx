import React, { useState, useEffect } from "react";
import { CourseType } from "../entities/four_year_plan";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
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

  const handleChange = (event: React.SyntheticEvent, newValue: number): void => {
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

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" centered>
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
            options={extractCategories(props.courseData)}
            label={"Subject"}
            onSelectOption={coursesByCategory}
            sx={{
              maxWidth: "unset",
              pt: "unset",
              pl: "unset"
            }}
          />
        </Grid>
        <Grid item xs={1}>
          <SearchableDropdown
              options={extractCategories(props.courseData)}
              label={"Number"}
              onSelectOption={coursesByCategory}
              sx={{
                maxWidth: "unset",
                pt: "unset",
                pl: "unset"
              }}
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
