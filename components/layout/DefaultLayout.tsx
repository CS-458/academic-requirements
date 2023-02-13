import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import { GOOGLE_FONT_PROVIDER } from "next/dist/shared/lib/constants";
import { useEffect } from "react";
import { GoogleAuth } from "google-auth-library";

export default function DefaultLayout(props: {
  children: JSX.Element | JSX.Element[];
}): JSX.Element {
function handleCallbackResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
  }

  useEffect(() => {
    google.account.id.initialize({
      client_id: "903868134209-gci8nov2ch84ge895l8sd3toore5bvtb.apps.googleusercontent.com",
      callback: handleCallbackResponse
    });

    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "outline", size: "large" }
    );
  }, []);

  return <div>
    <Box sx={{ flexGrow: 1 }}>
    <script src = "https://accounts.google.com/gsi/client" async defer></script>
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
