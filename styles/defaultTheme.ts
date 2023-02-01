import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      // light:
      main: "#7a9e7e"
      // dark:
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      // light:
      main: "#4f7cac"
      // dark: will be calculated from palette.secondary.main,
      // contrastText: '#ffffff',
    },
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: 3,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: 0.2
  }
});

export default theme;
