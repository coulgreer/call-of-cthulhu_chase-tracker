import React from "react";

import { createTheme, CssBaseline, ThemeProvider } from "@material-ui/core";
import Modal from "react-modal";

import "@fontsource/fraunces/400.css";
import "@fontsource/fraunces/400-italic.css";

import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/700.css";

import "./layout.css";

if (process.env.NODE_ENV !== "test") Modal.setAppElement("#___gatsby");

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  const headingMargin = "0 0 1.38rem";
  const theme = createTheme({
    palette: {
      type: "dark",
      background: { default: "#121212", paper: "#2E423B" },
      primary: { main: "#8FCCB8", dark: "#449779" },
      secondary: { main: "#F0DB82" },
    },
    typography: {
      fontFamily: "'Open Sans', sans-serif",
      h1: {
        fontFamily: "'Fraunces', serif",
        fontSize: "1.476rem",
        margin: headingMargin,
      },
      h2: {
        fontFamily: "'Fraunces', serif",
        fontSize: "1.383rem",
        margin: headingMargin,
      },
      h3: {
        fontFamily: "'Fraunces', serif",
        fontSize: "1.296rem",
        margin: headingMargin,
      },
      h4: {
        fontFamily: "'Fraunces', serif",
        fontSize: "1.215rem",
        margin: headingMargin,
      },
      h5: {
        fontFamily: "'Fraunces', serif",
        fontSize: "1.138rem",
        margin: headingMargin,
      },
      h6: {
        fontFamily: "'Fraunces', serif",
        fontSize: "1.067rem",
        margin: headingMargin,
      },
      body1: {
        fontWeight: 400,
        lineHeight: "150%",
        padding: "4px",
        margin: "0 0 1rem",
      },
      body2: {
        fontSize: "0.937rem",
        lineHeight: "150%",
        padding: "4px",
        margin: "0 0 1rem",
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>{children}</CssBaseline>
    </ThemeProvider>
  );
}
