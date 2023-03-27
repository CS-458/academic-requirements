import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuDrawer from "../NavigationMenu";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import jwtDecode from "jwt-decode";
import { User, UserLogin, UserInfo } from "../../services/user";
import LogoLink from "./LogoLink";
export default function DefaultLayout(props: {
  children: JSX.Element | JSX.Element[];
}): JSX.Element {
  const [user, setUser] = useState<User | undefined>(undefined);

  function responseMessage(token: CredentialResponse): void {
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

  return (
    <UserLogin.Provider value={user}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, position: "relative" }}>
          <Toolbar>
            <MenuDrawer/>
            <LogoLink/>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1 }} />
            {user === undefined ? (
              <GoogleLogin
                onSuccess={responseMessage}
                onError={errorMessage}
                useOneTap
              />
            ) : (
              <Typography variant="h5" component="div">
                <Box sx={{ m: 0 }}>
                  <span
                    style={{
                      margin: 0,
                      position: "absolute",
                      top: "50%",
                      transform: "translateY(-50%)",
                      right: "5rem"
                    }}
                  >
                    {user.info.name}
                  </span>
                  <img
                    src={user.info.picture}
                    style={{ height: "2em", borderRadius: "50%" }}
                  />
                </Box>
              </Typography>
            )}
          </Toolbar>
        </AppBar>
      </Box>
      {props.children}
    </UserLogin.Provider>
  );
}
