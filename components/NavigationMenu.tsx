import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  IconButton,
  Divider,
  Typography,
  createTheme,
  ThemeProvider
} from "@mui/material";
import {
  Menu,
  List as ListIcon,
  Schedule as ScheduleIcon,
  AccountCircle as AccountCircleIcon
} from "@mui/icons-material";
import Link from "next/link";
import { userToken } from "../services/user";
type Anchor = "left";

export default function MenuDrawer(): any {
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false
  });
  const [opened, setOpened] = useState<boolean>(false);
  const toggleDrawer =
    (anchor: Anchor, open: boolean) =>
      (event: React.KeyboardEvent | React.MouseEvent) => {
        setState({ ...state, [anchor]: open });
        setOpened(open);
      };

  const theme = createTheme({
    typography: {
      fontFamily: [
        "cursive",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "Arial",
        "sans-serif",
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol"
      ].join(",")
    }
  });

  const list = (anchor: Anchor): any => (
    <Box data-testid="box"
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
      sx={{ pt: "4em" }}
    >
      <List>
        <ListItem key={"Button Text"} disablePadding>
        <Link href="/">
          <ListItemButton data-testid="inputPageButton">
          <ListItemIcon>
          <ListIcon/>
        </ListItemIcon>
          <ThemeProvider theme = {theme}>
            <Typography fontFamily="cursive">Input Page</Typography>
          </ThemeProvider>
          </ListItemButton>
        </Link>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem key={"Button Text"} disablePadding>
        <Link href="/scheduler">
          <ListItemButton>
            <ListItemIcon>
              <ScheduleIcon/>
            </ListItemIcon>
            <ThemeProvider theme = {theme}>
            <Typography fontFamily="cursive">Schedule Page</Typography>
            </ThemeProvider>
          </ListItemButton>
        </Link>
        </ListItem>
      </List>
      <Divider />
      {userToken() !== undefined &&
      (<List>
          <ListItem key={"Button Text"} disablePadding>
          <Link href="/account">
            <ListItemButton>
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ThemeProvider theme = {theme}>
              <Typography fontFamily = "cursive">Account</Typography>
              </ThemeProvider>
            </ListItemButton>
          </Link>
          </ListItem>
      </List>
      )}
      <Divider />
    </Box>
  );

  return (
    <div>
      <React.Fragment key={"left"}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={toggleDrawer("left", !state.left)}
          data-testid="menu"
        >
          <Menu />
        </IconButton>
        <Drawer
          anchor={"left"}
          open={state.left}
          onClose={toggleDrawer("left", false)}
          data-testid={`drawer-${opened}`}
        >
          {list("left")}
        </Drawer>
      </React.Fragment>
    </div>
  );
}
