import { useState } from "react";
import { styled, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { CssBaseline } from "@mui/material";
import { RequirementComponentType } from "../entities/four_year_plan";
import { Requirement } from "./Requirement";

const drawerWidth = 300;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  overflowX: "hidden"
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(10)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(11)} + 1px)`
  }
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open"
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme)
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme)
  })
}));

export default function InformationDrawer(props: { requirementsDisplay: RequirementComponentType[] }): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);

  const handleDrawerOpen = (): void => {
    setOpen(true);
  };

  const handleDrawerClose = (): void => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Drawer variant="permanent" anchor="right" open={open}>
        <DrawerHeader></DrawerHeader>
        <DrawerHeader>
          { !open
            ? <IconButton onClick={handleDrawerOpen}>
                <ChevronLeftIcon />
              </IconButton>
            : <IconButton onClick={handleDrawerClose}>
                <ChevronRightIcon />
              </IconButton>
          }
        </DrawerHeader>
        <Divider />
        { open ? props.requirementsDisplay?.map(({ name, percentage }, index) => (
          <Requirement
            name={name}
            percentage={percentage}
            key={index}
          />))
          : props.requirementsDisplay?.map(({ shortName, percentage }, index) => (
          <Requirement
            name={shortName}
            percentage={percentage}
            key={index}
          />))
        }
        <Divider />
      </Drawer>
    </Box>
  );
}
/* {informationTypes.length === 1 && (
  <p
    style={{
      textAlign: "center",
      padding: "0px",
      fontSize: "1.1em"
    }}
  >
    {displayedInformationType}
  </p>
)}
{informationTypes.length > 1 && (
  <SearchableDropdown
    options={informationTypes}
    label={null}
    onSelectOption={setDisplayedInformationType}
  />
)}
</div>
<div className="right-information-box-content">
{displayedInformationType === "Requirements (Four Year Plan)" && (
  <>
    <p className="right-information-box-description">
      The four year plan for your concentration recommends taking
      courses in the following categories in the respective
      semesters.
    </p>
    { Object.keys(fourYearPlan.ClassPlan).map((key, index) => {
      if (fourYearPlan?.ClassPlan[key].Requirements.length > 0) {
        return (
          <div style={{ margin: "5px" }} key={index}>
            <p>{key}</p>
            <p
              style={{ marginLeft: "10px", marginBottom: "25px" }}
            >
              {fourYearPlan?.ClassPlan[
                key
              ].Requirements.toString()}
            </p>
          </div>
        );
      }
    })}
  </>
)}
{displayedInformationType === "Completed Courses" && (
  <>
    <p className="right-information-box-description">
      These are courses you marked as complete.
    </p>
    {userMajor()?.completed_courses?.map((completedCourse, index) => {
      return (
        <div className="info-box-completed-course">
          <a
            href={
              "https://bulletin.uwstout.edu/content.php?filter%5B27%5D=" +
              completedCourse.split("-")[0] +
              "&filter%5B29%5D=" +
              completedCourse.split("-")[1] +
              "&filter%5Bcourse_type%5D=-1&filter%5Bkeyword%5D=&filter%5B32%5D=1&filter%5Bcpage%5D=1&cur_cat_oid=21&expand=&navoid=544&search_database=Filter#acalog_template_course_filter"
            }
            target="_blank"
          >
            {completedCourse}
          </a>
        </div>
      );
    })}
  </>
)}
{displayedInformationType === "Requirements (Calculated)" && (
  <>
    <p className="right-information-box-description">
      Select a category and drag a course onto a semester to begin
      planning.
    </p>
  </>
)} */
