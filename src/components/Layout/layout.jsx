import React from "react";
import PropTypes from "prop-types";

import "@fontsource/fraunces";
import "@fontsource/fraunces/400-italic.css";

import "@fontsource/open-sans";
import "@fontsource/open-sans/700.css";

import "./layout.css";

function Layout({ children }) {
  return <>{children}</>;
}

Layout.propTypes = { children: PropTypes.node.isRequired };

export default Layout;
