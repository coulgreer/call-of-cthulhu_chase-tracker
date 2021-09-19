import React from "react";

import {
  Box,
  createTheme,
  CssBaseline,
  ThemeProvider,
} from "@material-ui/core";
import Modal from "react-modal";

import "@fontsource/fraunces/300.css";
import "@fontsource/fraunces/300-italic.css";
import "@fontsource/fraunces/400.css";

import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/600.css";
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
      background: { default: "#1C2421", paper: "#2E423B" },
      primary: { main: "#8FCCB8" },
      secondary: { main: "#F0DB82" },
      error: { main: "#CF6679", contrastText: "#000" },
    },
    typography: {
      h1: {
        fontFamily: "'Fraunces', serif",
        fontWeight: 300,
        fontSize: "2.027rem",
        margin: headingMargin,
      },
      h2: {
        fontFamily: "'Fraunces', serif",
        fontWeight: 300,
        fontSize: "1.802rem",
        margin: headingMargin,
      },
      h3: {
        fontFamily: "'Fraunces', serif",
        fontSize: "1.602rem",
        margin: headingMargin,
      },
      h4: {
        fontFamily: "'Fraunces', serif",
        fontSize: "1.424rem",
        margin: headingMargin,
      },
      h5: {
        fontFamily: "'Fraunces', serif",
        fontSize: "1.266rem",
        margin: headingMargin,
      },
      h6: {
        fontFamily: "'Fraunces', serif",
        fontSize: "1.125rem",
        margin: headingMargin,
      },
      body1: {
        fontFamily: "'Open Sans', sans-serif",
        lineHeight: "150%",
        padding: "4px",
        margin: "0 0 1rem",
      },
      body2: {
        fontFamily: "'Open Sans', sans-serif",
        fontSize: "0.889rem",
        lineHeight: "150%",
        padding: "4px",
        margin: "0 0 1rem",
      },
      button: {
        fontFamily: "'Open Sans', sans-serif",
        fontWeight: 600,
        fontSize: "0.889rem",
      },
    },
    overrides: {
      MuiFab: {
        secondary: {
          backgroundColor: "#E9C52A",
        },
      },
      MuiTableCell: {
        sizeSmall: {
          padding: "3px 12px 3px 8px",
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <Box width={360}>
          <>{children}</>
        </Box>
      </CssBaseline>
    </ThemeProvider>
  );
}
