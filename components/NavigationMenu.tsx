import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import Link from "next/link";
type Anchor = "left";

export default function MenuDrawer(): any {
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false
  });

  const toggleDrawer = (anchor: Anchor, open: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent
  ) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const list = (anchor: Anchor): any => (
    <Box
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        <ListItem key={"Button Text"} disablePadding>
        <Link href="/">
          <ListItemButton>
            Input Page
          </ListItemButton>
        </Link>
        </ListItem>
      </List>
      <List>
        <ListItem key={"Button Text"} disablePadding>
        <Link href="/scheduler">
          <ListItemButton>
            Schedule Page
          </ListItemButton>
        </Link>
        </ListItem>
      </List>
      <List>
          <ListItem key={"Button Text"} disablePadding>
          <Link href="/account">
            <ListItemButton>
              Account
            </ListItemButton>
          </Link>
          </ListItem>
      </List>
    </Box>
  );

  return (
    <div>
      <React.Fragment key={"left"}>
      <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={toggleDrawer("left", true)}>
            <MenuIcon/>
        </IconButton>
        <Drawer
          anchor={"left"}
          open={state.left}
          onClose={toggleDrawer("left", false)}
        >
          <br/>
          <br/>
          {list("left")}
        </Drawer>
      </React.Fragment>
    </div>
  );
}
