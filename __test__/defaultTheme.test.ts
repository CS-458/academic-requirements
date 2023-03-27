import theme from "../styles/defaultTheme";

const themeData = {
  palette: {
    primary: {
      main: "#7a9e7e"
    },
    secondary: {
      main: "#4f7cac"
    },
    contrastThreshold: 3,
    tonalOffset: 0.2
  }
};

test("Default Theme Values", () => {
  expect(theme.palette.primary.main).toBe(themeData.palette.primary.main);
  expect(theme.palette.primary.main).toBe(themeData.palette.primary.main);
  expect(theme.palette.contrastThreshold).toBe(themeData.palette.contrastThreshold);
  expect(theme.palette.tonalOffset).toBe(themeData.palette.tonalOffset);
});
