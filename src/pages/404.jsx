import * as React from "react";
import SEO from "../components/SEO";

import Layout from "../components/Layout";

export default function Custom404() {
  return (
    <Layout>
      <SEO />
      <h2>Page not found</h2>
      <p>Some things are meant to be forgotten...</p>
    </Layout>
  );
}
