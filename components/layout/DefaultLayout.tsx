import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";
import MenuDrawer from "../NavigationMenu";
export default function DefaultLayout(props: {
  children: JSX.Element | JSX.Element[];
}): JSX.Element {
  return <div>
    <Box sx={{ flexGrow: 1 }}>
  <AppBar position="static">
    <Toolbar>
      <MenuDrawer/>
    <img src="/logo-new.svg" height="60" alt="logo" />
    <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}/>
    <Button color="inherit">Login</Button>
    </Toolbar>
  </AppBar>
</Box>
{props.children}
</div>;
}
