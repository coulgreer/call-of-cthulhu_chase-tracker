import React from "react";

import { Transition, animated } from "react-spring/renderprops";

import Button from "../Button";

import ExpandLessIcon from "../../images/baseline_expand_less_black_24dp.png";
import ExpandMoreIcon from "../../images/baseline_expand_more_black_24dp.png";

import "./GroupRow.css";

import { Group } from "../../types";

interface Props {
  ownedIndex: number;
  groups: Group[];
}

interface State {
  isShown: boolean;
  distancerName: string;
}

export default class GroupRow extends React.Component<Props, State> {
  static INVALID_DISTANCER_NAME = "N/A";

  static DEFAULT_CHASE_NAME = "DEFAULT Chase";

  static get NO_DISTANCER_WARNING_MESSAGE() {
    return "No appetite for the hunt? In due time it will come. It always does...";
  }

  static get NO_PURSUER_WARNING_MESSAGE() {
    return "These little birds fly free. They haven't noticed, yet.";
  }

  static get NO_PARTICIPANT_WARNING_MESSAGE() {
    return "An emptiness, yet to be filled. This *thing* lacks purpose.";
  }

  constructor(props: Props) {
    super(props);

    const { groups, ownedIndex } = this.props;
    const currentGroup = groups[ownedIndex];

    this.state = {
      isShown: false,
      distancerName: currentGroup.distancerName,
    };

    this.toggleExpansion = this.toggleExpansion.bind(this);
    this.handleDistancerBlur = this.handleDistancerBlur.bind(this);
  }

  private handleDistancerBlur(evt: React.ChangeEvent<HTMLSelectElement>) {
    const { value } = evt.currentTarget;

    this.setState({ distancerName: value });
  }

  private toggleExpansion() {
    this.setState((state) => ({
      isShown: !state.isShown,
    }));
  }

  private renderMainContent() {
    const { groups, ownedIndex } = this.props;
    const { isShown } = this.state;

    return (
      <div className="GroupRow__main-display">
        <div className="GroupRow__merge-controls">
          <Button className="button button--small button--secondary">
            SPLIT
          </Button>
          <Button className="button button--small button--secondary">
            JOIN
          </Button>
        </div>
        <label className="input input__label">
          Name
          <input
            className="input__textbox input__textbox--full-width"
            defaultValue={groups[ownedIndex].name}
          />
        </label>
        <Button
          className="button button--primary button--small button--circular"
          onClick={this.toggleExpansion}
        >
          {isShown ? (
            <img src={ExpandLessIcon} alt="expand less" />
          ) : (
            <img src={ExpandMoreIcon} alt="expand more" />
          )}
        </Button>
      </div>
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
            <animated.div style={props} className="GroupRow__extended-display">
              {GroupRow.renderChaseName()}
              {this.renderDistancer()}
              {this.renderPursuers()}
              {this.renderMembers()}
            </animated.div>
          ))
        }
      </Transition>
    );
  }

  static renderChaseName() {
    return (
      <h3>
        Chase Name: <span>{GroupRow.DEFAULT_CHASE_NAME}</span>
      </h3>
    );
  }

  private renderDistancer() {
    const { ownedIndex, groups } = this.props;
    const { distancerName } = this.state;

    return (
      <>
        <label className="input input__label">
          Distancer
          <select
            className="input input__combobox input__combobox--full-width"
            onBlur={this.handleDistancerBlur}
          >
            <option value={GroupRow.INVALID_DISTANCER_NAME}>[N/A]</option>
            {groups.map(
              (group, index) =>
                ownedIndex !== index && (
                  <option value={group.name}>{group.name}</option>
                )
            )}
          </select>
        </label>
        <p
          className="centered error"
          hidden={distancerName !== GroupRow.INVALID_DISTANCER_NAME}
        >
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
        <h5>{pursuerLabel}</h5>
        <div aria-label={pursuerLabel} />
        <p
          className="centered error"
          hidden={groups[ownedIndex].pursuersNames.length > 0}
        >
          {GroupRow.NO_PURSUER_WARNING_MESSAGE}
        </p>
      </>
    );
  }

  private renderMembers() {
    const { groups, ownedIndex } = this.props;
    const currentGroup = groups[ownedIndex];

    return (
      <>
        <h3>Members</h3>
        <p>Highest MOV</p>
        <p>Lowest MOV</p>
        <div aria-label="Participants">
          {currentGroup.participants.length > 0 ? (
            currentGroup.participants.map((participant) => (
              <div>
                <p>{participant.name}</p>
                <p>{participant.movementRate}</p>
              </div>
            ))
          ) : (
            <p>{GroupRow.NO_PARTICIPANT_WARNING_MESSAGE}</p>
          )}
        </div>
        <Button className="button button--primary button--medium">ADD</Button>
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
