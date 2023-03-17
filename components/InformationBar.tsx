import { useState } from "react";
import { styled, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { CssBaseline } from "@mui/material";
import { RequirementComponentType } from "../entities/four_year_plan";
import { Requirement } from "./Requirement";
import { userMajor } from "../services/user";

const drawerWidth = 500;

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
  width: 155
  // width: `calc(${theme.spacing(13)} + 1px)`,
  // [theme.breakpoints.up("sm")]: {
  //   width: `calc(${theme.spacing(12)} + 1px)`
  // }
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open"
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  // whiteSpace: "nowrap",
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
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default function InformationDrawer(props: { requirementsDisplay: RequirementComponentType[] }): JSX.Element {
  const [fourYearPlan] = useState(JSON.parse(userMajor()?.concentration?.fourYearPlan ?? "{}"));
  const [completedCourses] = useState(userMajor()?.completed_courses ?? 0);
  const [loadPlan] = useState(userMajor()?.load_four_year_plan ?? false);
  const [open, setOpen] = useState<boolean>(false);

  const handleDrawerOpen = (): void => {
    setOpen(true);
  };

  const handleDrawerClose = (): void => {
    setOpen(false);
  };

  const [value, setValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setValue(newValue);
  };

  console.log(completedCourses);
  console.log(userMajor()?.load_four_year_plan);
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
            : <>
              <IconButton onClick={handleDrawerClose}>
                <ChevronRightIcon />
              </IconButton>
              <Tabs value={value} onChange={handleTabChange} aria-label="basic tabs example">
                <Tab label="Requirements" {...a11yProps(0)} />
                { loadPlan ? <Tab label="Four Year Plan" {...a11yProps(1)} /> : undefined}
                { completedCourses !== 0 ? <Tab label="Completed Courses" {...a11yProps(2)} /> : undefined}
              </Tabs>
              </>
          }
        </DrawerHeader>
        <Divider />
        <TabPanel value={value} index={0}>
          <Typography>Major</Typography>
          <Divider/>
        { open ? props.requirementsDisplay?.map(({ name, percentage }, index) => (<>
          { name === "Global Perspective (GLP)"
            ? <>
            <Typography>General Education</Typography>
            <Divider/>
            </> : <></>
          }
          <Requirement
            name={name}
            percentage={percentage}
            digits={100}
            key={index}
          /></>))
          : props.requirementsDisplay?.map(({ shortName, percentage }, index) => (<>
          { shortName === "GLP"
            ? <>
            <Typography>Gen Eds</Typography>
            <Divider/>
            </> : <></>
          }
          <Requirement
            name={shortName}
            percentage={percentage}
            digits={1}
            key={index}
          /></>))
        }
        </TabPanel>
        { loadPlan ? <TabPanel value={value} index={1}>
          <Typography>
            The four year plan for your concentration recommends taking
            courses in the following categories in the respective
            semesters.
          </Typography>
          { Object.keys(fourYearPlan.ClassPlan).map((key, index) => {
            if (fourYearPlan?.ClassPlan[key].Requirements.length > 0) {
              return (
                <div style={{ margin: "5px" }} key={index}>
                  <Typography>{key}</Typography>
                  <Typography style={{ marginLeft: "10px", marginBottom: "25px" }}>
                    { fourYearPlan?.ClassPlan[key].Requirements.toString() }
                  </Typography>
                </div>
              );
            }
          })}
        </TabPanel> : undefined}
        { completedCourses !== 0 ? <TabPanel value={value} index={2}>
          <Typography>
            These are courses you marked as complete.
          </Typography>
          {userMajor()?.completed_courses?.map((completedCourse, index) => {
            return (
              <div>
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
        </TabPanel> : undefined}
        <Divider />
      </Drawer>
    </Box>
  );
}
