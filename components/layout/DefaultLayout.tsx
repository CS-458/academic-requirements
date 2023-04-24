import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Popover,
  MenuList,
  MenuItem,
  Tooltip
} from "@mui/material";

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
import Router from "next/router";

let curTimeout: undefined | NodeJS.Timeout;

export default function DefaultLayout(props: {
  children: JSX.Element | JSX.Element[];
}): JSX.Element {
  const [user, setUser] = useState<User | undefined>(undefined);
  function setUserAndTimeout(user: User | undefined): void {
    setUser(user);
    clearTimeout(curTimeout);
    if (user !== undefined) {
      // settimeout for expiry
      curTimeout = setTimeout(() => {
        setUser(undefined);
      }, user.info.exp * 1000 - Date.now());
    }
  }

  const [firstLoad, setFirstLoad] = useState(true);
  useEffect(() => {
    const loaded = localStorage.getItem("google-login");
    if (loaded !== null) {
      const user: User = JSON.parse(loaded);
      const now = Date.now() / 1000;
      if (user.info.exp >= now && user.info.nbf <= now) {
        setUserAndTimeout(user);
      }
    }
    setFirstLoad(false);
  }, []);

  function logout(): void {
    localStorage.removeItem("google-login");
    setUserAndTimeout(undefined);
    // Just in case
    googleLogout();
  }

  function responseMessage(token: CredentialResponse): void {
    if (token.credential !== undefined) {
      const jwt: UserInfo = jwtDecode(token.credential);
      const user = { info: jwt, cred: token.credential };
      setUserAndTimeout(user);
      localStorage.setItem("google-login", JSON.stringify(user));
    }
  }
  function errorMessage(): void {
    console.error("Login failed");
  }
  const [picture, setPicture] = useState(user?.info.picture);
  useEffect(() => {
    setPicture(user?.info.picture);
  }, [user]);

  function UserLoginElement(): JSX.Element {
    // First load is true until we have attempted to load a user from localStorage.
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = (): void => {
      setAnchorEl(null);
    };

    if (firstLoad) {
      return <></>;
    }
    if (user === undefined) {
      return (
        <div data-testid="google-login-button">
          <GoogleLogin
            onSuccess={responseMessage}
            onError={errorMessage}
            useOneTap
          />
        </div>
      );
    }

    const open = anchorEl !== null;
    const id = open ? "simple-popover" : undefined;
    function handleListKeyDown(event: React.KeyboardEvent): void {
      if (event.key === "Tab") {
        event.preventDefault();
        setAnchorEl(null);
      } else if (event.key === "Escape") {
        setAnchorEl(null);
      }
    }
    function toAccountPage(): void {
      Router.push("/account").catch(console.error);
    }

    return (
      <Typography variant="h5" component="div" sx={{ fontSize: "1rem" }}>
        <Button aria-describedby={id} onClick={handleClick}>
          <Tooltip title={"Manage Profile"}>
            <img
              src={picture}
              onError={(e) => {
                console.log(e);
                const target = e.target;
                if (target instanceof HTMLImageElement) {
                  target.src = "/defaultProfile.png";
                }
              }}
              style={{ height: "2em", borderRadius: "50%" }}
              data-testid="account-picture"
            />
          </Tooltip>
        </Button>
        <Popover
          id={id}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right"
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right"
          }}
        >
          <MenuList
            autoFocusItem={open}
            id="composition-menu"
            aria-labelledby="composition-button"
            onKeyDown={handleListKeyDown}
          >
            <MenuItem onClick={toAccountPage}>Account</MenuItem>
            <MenuItem onClick={logout}>Logout</MenuItem>
          </MenuList>
        </Popover>
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
