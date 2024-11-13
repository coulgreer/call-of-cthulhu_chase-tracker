import * as React from "react";
import SEO from "../components/SEO";

import Layout from "../components/Layout";
import ChaseControls from "../components/ChaseControls";
import TabbedDisplay from "../components/TabbedDisplay";

import ChaseStartContext from "../contexts/ChaseStartContext";

export function PureHome() {
  let [hasStarted, setHasStarted] = React.useState(false);

  return (
    <main>
      <ChaseStartContext.Provider value={
        { hasStarted, setHasStarted }
      }>
        <ChaseControls />
        <TabbedDisplay />
      </ChaseStartContext.Provider>
    </main>
  );
}

export const Home = () => {
  return (
    <Layout>
      <SEO />
      <PureHome />
    </Layout>
  );
};

export default Home;
