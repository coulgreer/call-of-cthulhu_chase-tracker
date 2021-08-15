import React from "react";
import PropTypes from "prop-types";

import "@fontsource/fraunces/400.css";
import "@fontsource/fraunces/400-italic.css";

import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/700.css";

import "./layout.css";

interface Props {
  children: React.ReactNode;
}

function Layout({ children }: Props) {
  return <>{children}</>;
}

Layout.propTypes = { children: PropTypes.node.isRequired };

export default Layout;
