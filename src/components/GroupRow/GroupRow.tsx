import React from "react";
import { Transition, animated } from "react-spring/renderprops";

import Button from "../Button";

import ExpandLessIcon from "../../images/expand_less_black_24dp.svg";
import ExpandMoreIcon from "../../images/expand_more_black_24dp.svg";

import "./GroupRow.css";

import { Group } from "../../types";

interface Props {
  ownedIndex: number;
  groups: Group[];
  onDistancerBlur?: (target: Group, distancer: Group | undefined) => void;
}

interface State {
  isShown: boolean;
}

export default class GroupRow extends React.Component<Props, State> {
  static INVALID_DISTANCER_ID = "N/A";

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

    this.state = {
      isShown: false,
    };

    this.toggleExpansion = this.toggleExpansion.bind(this);
    this.handleDistancerBlur = this.handleDistancerBlur.bind(this);
  }

  private handleDistancerBlur(evt: React.ChangeEvent<HTMLSelectElement>) {
    const { groups, ownedIndex, onDistancerBlur } = this.props;
    const { value } = evt.currentTarget;
    const distancer = groups.find((group) => group.id === value);

    if (onDistancerBlur !== undefined) {
      onDistancerBlur(groups[ownedIndex], distancer);
    }
  }

  private getHighestMov() {
    const { groups, ownedIndex } = this.props;
    const { participants } = groups[ownedIndex];

    if (participants.length <= 0) return "N/A";

    let result = participants[0].movementRate;

    participants.forEach((participant) => {
      if (participant.movementRate > result) result = participant.movementRate;
    });

    return result.toString();
  }

  private getLowestMov() {
    const { groups, ownedIndex } = this.props;
    const { participants } = groups[ownedIndex];

    if (participants.length <= 0) return "N/A";

    let result = participants[0].movementRate;

    participants.forEach((participant) => {
      if (participant.movementRate < result) result = participant.movementRate;
    });

    return result.toString();
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
      <div className="GroupRow__main-container">
        <div className="GroupRow__merge-control-container">
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
          aria-expanded={isShown}
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
            <animated.div
              style={props}
              className="GroupRow__extended-container"
            >
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
      <div className="GroupRow__section-container">
        <h2 className="GroupRow__title" aria-label="Chase name">
          Chase Name: <em>{GroupRow.DEFAULT_CHASE_NAME}</em>
        </h2>
      </div>
    );
  }

  private renderDistancer() {
    const { ownedIndex, groups } = this.props;

    const currentGroup = groups[ownedIndex];

    return (
      <div className="GroupRow__section-container">
        <label className="input input__label">
          Distancer
          <select
            className="input input__combobox input__combobox--full-width"
            onBlur={this.handleDistancerBlur}
          >
            <option key="default" value={GroupRow.INVALID_DISTANCER_ID}>
              [N/A]
            </option>
            {groups.map(
              (group, index) =>
                ownedIndex !== index && (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                )
            )}
          </select>
        </label>
        <p
          className="centered error text--small"
          hidden={currentGroup.distancerId !== GroupRow.INVALID_DISTANCER_ID}
        >
          {GroupRow.NO_DISTANCER_WARNING_MESSAGE}
        </p>
      </div>
    );
  }

  private renderPursuers() {
    const { ownedIndex, groups } = this.props;
    const currentGroup = groups[ownedIndex];
    const pursuerLabel = "Pursuer(s)";

    return (
      <div className="GroupRow__section-container">
        <h2 className="GroupRow__title">{pursuerLabel}</h2>
        <ul aria-label={pursuerLabel}>
          {currentGroup.pursuersIds.map((pursuerId) => (
            <li>{pursuerId}</li>
          ))}
        </ul>
        <p
          className="centered error text--small"
          hidden={currentGroup.pursuersIds.length > 0}
        >
          {GroupRow.NO_PURSUER_WARNING_MESSAGE}
        </p>
      </div>
    );
  }

  private renderMembers() {
    const { groups, ownedIndex } = this.props;
    const currentGroup = groups[ownedIndex];

    return (
      <div className="GroupRow__section-container">
        <h2 className="GroupRow__title">Members</h2>
        <div className="GroupRow__pursuer-movement">
          <p className="text--small">{`Highest MOV : ${this.getHighestMov()}`}</p>
          <p className="text--small">{`Lowest MOV : ${this.getLowestMov()}`}</p>
        </div>
        {currentGroup.participants.length > 0 ? (
          <ul aria-label="Participants">
            {currentGroup.participants.map((participant) => (
              <li>
                <p>{participant.name}</p>
                <p>{participant.movementRate}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="centered error text--small">
            {GroupRow.NO_PARTICIPANT_WARNING_MESSAGE}
          </p>
        )}
        <Button className="button button--primary button--medium">ADD</Button>
      </div>
    );
  }

  render() {
    const { ownedIndex, groups } = this.props;

    return (
      <div
        role="gridcell"
        tabIndex={0}
        aria-label={`${groups[ownedIndex].name} editor`}
        className="GroupRow"
      >
        {this.renderMainContent()}
        {this.renderExpandedContent()}
      </div>
    );
  }
}
