import { useState } from "react";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import {
  CssBaseline,
  IconButton,
  Divider,
  Typography,
  Tab,
  Tabs,
  Box,
  styled,
  Theme,
  CSSObject,
  Drawer
} from "@mui/material";
import { RequirementComponentType } from "../entities/four_year_plan";
import { Requirement } from "./Requirement";
import { userMajor } from "../services/user";

const drawerWidth = "37%";

const openedDrawer = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  overflowX: "hidden",
  boxShadow: "-5px 0px 20px gray"
});

const closedDrawer = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  overflowX: "hidden",
  width: "10%"
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  // padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar
}));

const MuiDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open"
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  // whiteSpace: "nowrap",
  // boxSizing: "border-box",
  ...(open != null &&
    open && {
    ...openedDrawer(theme),
    "& .MuiDrawer-paper": openedDrawer(theme)
  }),
  ...(open != null &&
    !open && {
    ...closedDrawer(theme),
    "& .MuiDrawer-paper": closedDrawer(theme)
  })
}));

function a11yProps(index: number): any {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`
  };
}
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
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
      {value === index && <Box sx={{ pl: 1, pr: 2 }}>{children}</Box>}
    </div>
  );
}

export default function InformationDrawer(props: {
  requirementsDisplay: RequirementComponentType[];
}): JSX.Element {
  const [fourYearPlan] = useState(
    JSON.parse(userMajor()?.concentration?.fourYearPlan ?? "{}")
  );
  const [completedCourses] = useState(userMajor()?.completed_courses ?? []);
  const [loadPlan] = useState(userMajor()?.load_four_year_plan ?? false);
  const [open, setOpen] = useState<boolean>(false);
  const [storedTab, setStoredTab] = useState<number>(0);

  const handleDrawerOpen = (): void => {
    setOpen(true);
    if (storedTab !== 0) {
      handleTabChange(undefined, storedTab);
    }
  };

  const handleDrawerClose = (): void => {
    setOpen(false);
    setStoredTab(value);
    handleTabChange(undefined, 0);
  };

  const [value, setValue] = useState(0);

  const handleTabChange = (
    event: React.SyntheticEvent | undefined,
    newValue: number
  ): void => {
    setValue(newValue);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <MuiDrawer variant="permanent" anchor="right" open={open}>
        <DrawerHeader></DrawerHeader>
        <DrawerHeader sx={{ p: 0 }}>
          {!open ? (
            <IconButton data-testid="openDrawer" onClick={handleDrawerOpen}>
              <ChevronLeft />
            </IconButton>
          ) : (
            <>
              <IconButton data-testid="closeDrawer" onClick={handleDrawerClose}>
                <ChevronRight />
              </IconButton>
              <Tabs
                value={value}
                onChange={handleTabChange}
                aria-label="basic tabs example"
              >
                <Tab label="Requirements" {...a11yProps(0)} key={0} />
                {completedCourses.length !== 0 ? (
                  <Tab label="Completed Courses" {...a11yProps(1)} key={1} />
                ) : loadPlan ? (
                  <Tab label="Four Year Plan" {...a11yProps(1)} key={1} />
                ) : undefined}
                {completedCourses.length !== 0 && loadPlan ? (
                  <Tab label="Four Year Plan" {...a11yProps(2)} key={2} />
                ) : undefined}
              </Tabs>
            </>
          )}
        </DrawerHeader>
        {open ? <Divider /> : undefined}
        <TabPanel value={value} index={0} key={0}>
          <Typography sx={{ color: "primary.main" }}>Major</Typography>
          <Divider sx={{ color: "primary.main", mb: "10px" }} />
          {open
            ? props.requirementsDisplay?.map(({ name, percentage }, index) => (
              <div key={index}>
                {name === "Global Perspective (GLP)" ? (
                  <>
                    <Typography sx={{ color: "primary.main" }}>
                      General Education
                    </Typography>
                    <Divider sx={{ color: "primary.main", mb: "10px" }} />
                  </>
                ) : (
                  <></>
                )}
                <Requirement
                  name={name}
                  percentage={percentage}
                  digits={1}
                  key={index}
                />
              </div>
            ))
            : props.requirementsDisplay?.map(
              ({ shortName, percentage }, index) => (
                <div key={index}>
                  {shortName === "GLP" ? (
                    <>
                      <Typography sx={{ color: "primary.main" }}>
                        Gen Eds
                      </Typography>
                      <Divider sx={{ color: "primary.main", mb: "10px" }} />
                    </>
                  ) : (
                    <></>
                  )}
                  <Requirement
                    name={shortName}
                    percentage={percentage}
                    digits={0}
                    key={index}
                  />
                </div>
              )
            )}
        </TabPanel>
        {loadPlan ? (
          <TabPanel value={value} index={completedCourses.length !== 0 ? 2 : 1}>
            <Typography sx={{ color: "primary.main" }}>
              The four year plan for your concentration recommends taking
              courses in the following categories in the respective semesters.
            </Typography>
            {Object.keys(fourYearPlan.ClassPlan).map((key, index) => {
              if (fourYearPlan?.ClassPlan[key].Requirements.length > 0) {
                return (
                  <div style={{ margin: "5px" }} key={index}>
                    <Typography key={index + 0.5}>{key}</Typography>
                    <Typography
                      style={{ marginLeft: "10px", marginBottom: "25px" }}
                      key={index}
                    >
                      {fourYearPlan?.ClassPlan[key].Requirements.toString()}
                    </Typography>
                  </div>
                );
              }
            })}
          </TabPanel>
        ) : undefined}
        {completedCourses.length !== 0 ? (
          <TabPanel value={value} index={1}>
            <Typography sx={{ color: "primary.main" }}>
              These are courses you marked as complete.
            </Typography>
            {completedCourses.map((completedCourse, index) => {
              return (
                <div key={index}>
                  <br />
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
          </TabPanel>
        ) : undefined}
      </MuiDrawer>
    </Box>
  );
}
