import React from "react";

import { Transition, animated } from "react-spring/renderprops";

import Button from "../Button";

interface Props {
  ownedIndex: number;
  groups: Data[];
}

interface State {
  isShown: boolean;
  distancerName: string;
}

interface Data {
  id: number;
  name: string;
  pursuerNames: string[];
}

export default class GroupRow extends React.Component<Props, State> {
  static DEFAULT_DISTANCER_NAME = "N/A";

  static get NO_DISTANCER_WARNING_MESSAGE() {
    return "No appetite for the hunt? In due time it will come. It always does...";
  }

  static get NO_PURSUER_WARNING_MESSAGE() {
    return "These little birds fly free. They haven't noticed, yet.";
  }

  constructor(props: Props) {
    super(props);

    this.state = {
      isShown: false,
      distancerName: GroupRow.DEFAULT_DISTANCER_NAME,
    };

    this.toggleExpansion = this.toggleExpansion.bind(this);
    this.handleDistancerBlur = this.handleDistancerBlur.bind(this);
  }

  private toggleExpansion() {
    this.setState((state) => ({
      isShown: !state.isShown,
    }));
  }

  private handleDistancerBlur(evt: React.ChangeEvent<HTMLSelectElement>) {
    const { value } = evt.currentTarget;

    this.setState({ distancerName: value });
  }

  private renderMainContent() {
    const { isShown } = this.state;

    return (
      <>
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
      </>
    );
  }

  private renderExpandedContent() {
    const { isShown } = this.state;

    return (
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
              {this.renderDistancer()}
              {this.renderPursuers()}
            </animated.div>
          ))
        }
      </Transition>
    );
  }

  private renderDistancer() {
    const { ownedIndex, groups } = this.props;
    const { distancerName: distancer } = this.state;

    return (
      <>
        <label>
          Distancer
          <select onBlur={this.handleDistancerBlur}>
            <option value={GroupRow.DEFAULT_DISTANCER_NAME}>[N/A]</option>
            {groups.map(
              (group, index) =>
                ownedIndex !== index && (
                  <option value={group.name}>{group.name}</option>
                )
            )}
          </select>
        </label>
        <p hidden={distancer === GroupRow.DEFAULT_DISTANCER_NAME}>
          {GroupRow.NO_DISTANCER_WARNING_MESSAGE}
        </p>
      </>
    );
  }

  private renderPursuers() {
    const { ownedIndex, groups } = this.props;
    const pursuerLabel = "Pursuer(s)";

    return (
      <>
        <p>{pursuerLabel}</p>
        <div aria-label={pursuerLabel} />
        <p hidden={groups[ownedIndex].pursuerNames.length > 0}>
          {GroupRow.NO_PURSUER_WARNING_MESSAGE}
        </p>
        <h3>Members</h3>
        <p>Highest MOV</p>
        <p>Lowest MOV</p>
        <Button>ADD</Button>
      </>
    );
  }

  render() {
    return (
      <div className="GroupRow">
        {this.renderMainContent()}
        {this.renderExpandedContent()}
      </div>
    );
  }
}
