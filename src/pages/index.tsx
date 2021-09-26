import * as React from "react";
import SEO from "../components/SEO";

import Layout from "../components/Layout";
import ChaseControls from "../components/ChaseControls";
import TabbedDisplay from "../components/TabbedDisplay";

import ChaseStartContext from "../contexts/ChaseStartContext";

interface State {
  hasStarted: boolean;
}

export class PureHome extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);

    this.state = { hasStarted: false };

    this.handleStartChaseClick = this.handleStartChaseClick.bind(this);
    this.handleStopChaseClick = this.handleStopChaseClick.bind(this);
  }

  handleStartChaseClick() {
    this.setState({ hasStarted: true });
  }

  handleStopChaseClick() {
    this.setState({ hasStarted: false });
  }

  render() {
    const { hasStarted } = this.state;

    return (
      <main>
        <ChaseStartContext.Provider value={hasStarted}>
          <ChaseControls
            onStartButtonClick={this.handleStartChaseClick}
            onStopButtonClick={this.handleStopChaseClick}
          />
          <TabbedDisplay />
        </ChaseStartContext.Provider>
      </main>
    );
  }
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
