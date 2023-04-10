import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MenuDrawer from "../NavigationMenu";
import {
  CredentialResponse,
  GoogleLogin,
  googleLogout
} from "@react-oauth/google";
import { useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import { User, UserLogin, UserInfo } from "../../services/user";
import LogoLink from "./LogoLink";
import { Button } from "@mui/material";

export default function DefaultLayout(props: {
  children: JSX.Element | JSX.Element[];
}): JSX.Element {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [firstLoad, setFirstLoad] = useState(true);
  useEffect(() => {
    const loaded = localStorage.getItem("google-login");
    if (loaded !== null) {
      setUser(JSON.parse(loaded));
    }
    console.log("Checking login state");
    setFirstLoad(false);
  }, []);

  function logout(): void {
    localStorage.removeItem("google-login");
    setUser(undefined);
    // Just in case
    googleLogout();
  }

  function responseMessage(token: CredentialResponse): void {
    console.log(token);
    if (token.credential !== undefined) {
      const jwt: UserInfo = jwtDecode(token.credential);
      console.log(jwt);
      const user = { info: jwt, cred: token.credential };
      setUser(user);
      localStorage.setItem("google-login", JSON.stringify(user));
    }
  }
  function errorMessage(): void {
    console.error("Login failed");
  }
  // interface AppBarProps extends MuiAppBarProps {
  //   open?: boolean;
  // }

  // const AppBar = styled(MuiAppBar, {
  //   shouldForwardProp: (prop) => prop !== "open"
  // })<AppBarProps>(({ theme, open }) => ({
  //   zIndex: theme.zIndex.drawer + 1,
  //   transition: theme.transitions.create(["width", "margin"], {
  //     easing: theme.transitions.easing.sharp,
  //     duration: theme.transitions.duration.leavingScreen
  //   })
  // }));
  const [picture, setPicture] = useState(user?.info.picture);
  useEffect(() => {
    setPicture(user?.info.picture);
  }, [user]);

  function UserLoginElement(): JSX.Element {
    // First load is true until we have attempted to load a user from localStorage.
    if (firstLoad) {
      return <></>;
    }
    if (user === undefined) {
      return (
        <GoogleLogin
          onSuccess={responseMessage}
          onError={errorMessage}
          useOneTap
        />
      );
    }
    return (
      <Typography variant="h5" component="div" sx={{ fontSize: "1rem" }}>
        <Stack sx={{ m: 0 }} direction="row" spacing={1}>
          <img
            src={picture}
            onError={() => {
              if (picture === undefined) return;
              if (picture.startsWith("https://lh3")) {
                setPicture(picture.replace("lh3", "lh4"));
              } else if (picture.startsWith("https://lh4")) {
                setPicture(picture.replace("lh4", "lh5"));
              }
            }}
            style={{ height: "2em", borderRadius: "50%" }}
          />
          <Button
            onClick={logout}
            sx={{
              color: "text.primary",
              bgcolor: "white",
              pr: 2,
              pl: 2
            }}
          >
            Logout
          </Button>
        </Stack>
      </Typography>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "grid",
        gridTemplateRows: "min-content minmax(0px, auto)"
      }}
    >
      <UserLogin.Provider value={user}>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar
            position="fixed"
            sx={{
              zIndex: (theme) => theme.zIndex.drawer + 1,
              position: "relative"
            }}
          >
            <Toolbar>
              <MenuDrawer />
              <LogoLink />
              <Typography variant="h5" component="div" sx={{ flexGrow: 1 }} />
              <UserLoginElement />
            </Toolbar>
          </AppBar>
        </Box>
        {props.children}
      </UserLogin.Provider>
    </div>
  );
}
