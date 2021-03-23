import React from "react";

import { Transition, animated } from "react-spring/renderprops";

import Button from "../Button";

interface Props {}

interface State {
  isShown: boolean;
}

export default class GroupRow extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { isShown: false };

    this.toggleExpansion = this.toggleExpansion.bind(this);
  }

  private toggleExpansion() {
    this.setState((state) => ({
      isShown: !state.isShown,
    }));
  }

  render() {
    const { isShown } = this.state;
    const pursuerLabel = "Pursuer(s)";

    return (
      <div className="GroupRow">
        <Button>SPLIT</Button>
        <Button>JOIN</Button>
        <label>
          Name
          <input />
        </label>
        <Button onClick={this.toggleExpansion}>
          {isShown ? (
            <img src="#" alt="expand less" />
          ) : (
            <img src="#" alt="expand more" />
          )}
        </Button>
        <Transition
          native
          items={isShown}
          from={{ height: 0, overflow: "hidden" }}
          enter={{ height: "auto" }}
          leave={{ height: 0 }}
        >
          {(shown) =>
            shown &&
            ((props) => (
              <animated.div style={props}>
                <label>
                  Distancer
                  <select />
                </label>
                <p>{pursuerLabel}</p>
                <div aria-label={pursuerLabel} />
                <h3>Members</h3>
                <p>Highest MOV</p>
                <p>Lowest MOV</p>
                <Button>ADD</Button>
              </animated.div>
            ))
          }
        </Transition>
      </div>
    );
  }
}
