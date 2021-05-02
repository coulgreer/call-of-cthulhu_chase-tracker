import React from "react";
import SEO from "../components/SEO";

import Layout from "../components/Layout";
import TabbedDisplay from "../components/TabbedDisplay";

export default function Home() {
  return (
    <Layout>
      <SEO />
      <TabbedDisplay />
    </Layout>
  );
}
