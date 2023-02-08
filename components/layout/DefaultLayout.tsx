import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
export default function DefaultLayout(props: {
  children: JSX.Element | JSX.Element[];
}): JSX.Element {
  return <div>
    <Box sx={{ flexGrow: 1 }}>
  <AppBar position="static">
    <Toolbar>
    <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
      <MenuIcon />
    </IconButton>
    <img src="/logo-new.svg" height="60" alt="logo" />
    <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}/>
    <Button color="inherit">Login</Button>
    </Toolbar>
  </AppBar>
</Box>
{props.children}
</div>;
}
