import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
// import { GOOGLE_FONT_PROVIDER } from "next/dist/shared/lib/constants";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import jwtDecode from "jwt-decode";

interface UserInfo {
  /// Profile URL
  picture: string;
  /// User ID
  sub: string;
  name: string;
  email: string;
}

interface User {
  info: UserInfo;
  cred: string;
}

export default function DefaultLayout(props: {
  children: JSX.Element | JSX.Element[];
}): JSX.Element {
  const [user, setUser] = useState<User | undefined>(undefined);

  function responseMessage(token: CredentialResponse) {
    console.log(token);
    if (token.credential !== undefined) {
      const jwt: UserInfo = jwtDecode(token.credential);
      console.log(jwt);
      setUser({ info: jwt, cred: token.credential });
      fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({
          token: token.credential
        })
      }).then(console.log, console.error);
    }
  }
  function errorMessage() {
    console.error("Login failed");
  }

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <img src="/logo-new.svg" height="60" alt="logo" />
            <Typography variant="h5" component="div" sx={{ flexGrow: 1 }} />
            {user === undefined ? (
              <GoogleLogin
                onSuccess={responseMessage}
                onError={errorMessage}
                useOneTap
              />
            ) : (
              <Typography variant="h5" component="div">
                <span>{user.info.name}</span>
                <img src={user.info.picture} style={{ height: "1em" }} />
              </Typography>
            )}
          </Toolbar>
        </AppBar>
      </Box>
      {props.children}
    </div>
  );
}
