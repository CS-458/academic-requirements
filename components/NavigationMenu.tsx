import * as React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  IconButton
} from "@mui/material";
import { Menu } from "@mui/icons-material";
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

  const toggleDrawer =
    (anchor: Anchor, open: boolean) =>
      (event: React.KeyboardEvent | React.MouseEvent) => {
        setState({ ...state, [anchor]: open });
      };

  const list = (anchor: Anchor): any => (
    <Box
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
      sx={{ pt: "4em" }}
    >
      <List>
        <ListItem key={"Button Text"} disablePadding>
          <Link href="/">
            <ListItemButton data-testid="inputPageButton">
              Input Page
            </ListItemButton>
          </Link>
        </ListItem>
      </List>
      <List>
        <ListItem key={"Button Text"} disablePadding>
          <Link href="/scheduler">
            <ListItemButton>Schedule Page</ListItemButton>
          </Link>
        </ListItem>
      </List>
      {userToken() !== undefined && (
        <List>
          <ListItem key={"Button Text"} disablePadding>
            <Link href="/account">
              <ListItemButton>Account</ListItemButton>
            </Link>
          </ListItem>
        </List>
      )}
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
          onClick={toggleDrawer("left", true)}
          data-testid="menu"
        >
          <Menu />
        </IconButton>
        <Drawer
          anchor={"left"}
          open={state.left}
          onClose={toggleDrawer("left", false)}
        >
          {list("left")}
        </Drawer>
      </React.Fragment>
    </div>
  );
}
