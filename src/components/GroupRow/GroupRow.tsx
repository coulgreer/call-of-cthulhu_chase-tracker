import React from "react";

import clsx from "clsx";
import { Transition, animated } from "react-spring/renderprops";
import Modal from "react-modal";
import { nanoid } from "nanoid";

import Button from "../Button";

import "./GroupRow.css";

import { Group, Participant } from "../../types";

interface Props {
  ownedIndex: number;
  groups: Group[];
  participants?: Participant[];
  onDistancerBlur?: (target: Group, distancer: Group | undefined) => void;
  onSubmit?: (group: Group) => void;
}

interface State {
  selectedParticipantsIds: string[];
  expansionShown: boolean;
  modalShown: boolean;
}

export default class GroupRow extends React.Component<Props, State> {
  static get INVALID_DISTANCER_ID() {
    return "N/A";
  }

  static get DEFAULT_CHASE_NAME() {
    return "DEFAULT Chase";
  }

  static get NO_DISTANCER_WARNING_MESSAGE() {
    return "No appetite for the hunt? In due time it will come. It always does...";
  }

  static get NO_PURSUER_WARNING_MESSAGE() {
    return "These little birds fly free. They haven't noticed, yet.";
  }

  static get NO_MEMBER_WARNING_MESSAGE() {
    return "An emptiness, yet to be filled. This *thing* lacks purpose.";
  }

  static get NO_AVAILABLE_PARTICIPANT_WARNING_MESSAGE() {
    return "A place void of life... past or present. All claimed. None free.";
  }

  static get HIGHEST_MOVEMENT_CLASS_NAME() {
    return "GroupRow--highest";
  }

  static get LOWEST_MOVEMENT_CLASS_NAME() {
    return "GroupRow--lowest";
  }

  static get EXPANSION_PREFIX() {
    return "group-row-expansion";
  }

  private id;

  private lowestMovementRating: string;

  private highestMovementRating: string;

  constructor(props: Props) {
    super(props);

    this.state = {
      selectedParticipantsIds: [],
      expansionShown: false,
      modalShown: false,
    };

    this.id = nanoid();

    this.lowestMovementRating = "";
    this.highestMovementRating = "";

    // Event handlers
    this.handleExpandClick = this.handleExpandClick.bind(this);
    this.handleDistancerBlur = this.handleDistancerBlur.bind(this);
    this.handleAddClick = this.handleAddClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.closeModal = this.closeModal.bind(this);

    // Helpers
    this.findParticipantById = this.findParticipantById.bind(this);
    this.isAvailable = this.isAvailable.bind(this);
  }

  private handleExpandClick() {
    this.setState((state) => ({
      expansionShown: !state.expansionShown,
    }));
  }

  private handleDistancerBlur(event: React.ChangeEvent<HTMLSelectElement>) {
    const { groups, ownedIndex, onDistancerBlur } = this.props;
    const { value } = event.currentTarget;
    const distancer = groups.find((group) => group.id === value);

    if (onDistancerBlur) onDistancerBlur(groups[ownedIndex], distancer);
  }

  private handleAddClick() {
    this.setState({ modalShown: true });
  }

  private handleSubmit() {
    const { groups, ownedIndex, onSubmit } = this.props;
    const { selectedParticipantsIds } = this.state;
    const { participants: currentParticipants } = groups[ownedIndex];

    const selectedParticipants = selectedParticipantsIds
      .map(this.findParticipantById)
      .filter((participant): participant is Participant => !!participant);

    groups[ownedIndex].participants = selectedParticipants.concat(
      currentParticipants
    );

    if (onSubmit) onSubmit(groups[ownedIndex]);

    this.setState({ selectedParticipantsIds: [] });

    this.closeModal();
  }

  private handleCheckboxChange(event: React.FormEvent<HTMLInputElement>) {
    const { value, checked } = event.currentTarget;

    this.setState((state) => {
      const { selectedParticipantsIds } = state;

      if (checked) {
        selectedParticipantsIds.push(value);
      } else {
        const targetIndex = selectedParticipantsIds.indexOf(value);
        selectedParticipantsIds.splice(targetIndex, 1);
      }

      return { selectedParticipantsIds };
    });
  }

  private getBoundaryClassName(participant: Participant) {
    const { movementRate } = participant;
    const movementStr = movementRate.toString();

    if (this.areBoundariesEqual()) return "";

    if (this.highestMovementRating === movementStr) {
      return GroupRow.HIGHEST_MOVEMENT_CLASS_NAME;
    }

    if (this.lowestMovementRating === movementStr) {
      return GroupRow.LOWEST_MOVEMENT_CLASS_NAME;
    }

    return "";
  }

  private closeModal() {
    this.setState({ modalShown: false });
  }

  private findHighestMovementRate() {
    const { groups, ownedIndex } = this.props;
    const { participants } = groups[ownedIndex];

    if (participants.length <= 0) return "N/A";

    let result = participants[0].movementRate;

    participants.forEach((participant) => {
      if (participant.movementRate > result) result = participant.movementRate;
    });

    return result.toString();
  }

  private findLowestMovementRate() {
    const { groups, ownedIndex } = this.props;
    const { participants } = groups[ownedIndex];

    if (participants.length <= 0) return "N/A";

    let result = participants[0].movementRate;

    participants.forEach((participant) => {
      if (participant.movementRate < result) result = participant.movementRate;
    });

    return result.toString();
  }

  private areBoundariesEqual() {
    return this.highestMovementRating === this.lowestMovementRating;
  }

  private findParticipantById(id: string) {
    const { participants } = this.props;

    if (!participants) return undefined;

    const index = participants.findIndex(
      (participant) => id === participant.id
    );

    return participants[index];
  }

  private isAvailable(participant: Participant) {
    if (participant.isGrouped) return false;

    const { groups, ownedIndex } = this.props;
    const { participants: ownedParticipants } = groups[ownedIndex];
    let isAvailable = true;

    ownedParticipants.forEach((ownedParticipant) => {
      if (ownedParticipant.id === participant.id) isAvailable = false;
    });

    return isAvailable;
  }

  private renderMainContent() {
    const { groups, ownedIndex } = this.props;
    const { expansionShown } = this.state;

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
        <label>
          <span className="input__label">Name</span>
          <input
            className="textbox textbox--full-width"
            defaultValue={groups[ownedIndex].name}
          />
        </label>
        <Button
          className="button button--primary button--small button--circular"
          aria-label="Group Details"
          aria-expanded={expansionShown}
          aria-controls={`${GroupRow.EXPANSION_PREFIX}-${this.id}`}
          onClick={this.handleExpandClick}
        >
          {expansionShown ? (
            <span className="material-icons" aria-hidden>
              expand_less
            </span>
          ) : (
            <span className="material-icons" aria-hidden>
              expand_more
            </span>
          )}
        </Button>
      </div>
    );
  }

  private renderExpandedContent() {
    const { expansionShown } = this.state;

    return (
      <Transition
        native
        items={expansionShown}
        from={{ height: 0, overflow: "hidden" }}
        enter={{ height: "auto" }}
        leave={{ height: 0 }}
      >
        {(shown) =>
          shown &&
          ((props) => (
            <animated.div
              id={`${GroupRow.EXPANSION_PREFIX}-${this.id}`}
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
        <label>
          <span className="input__label">Distancer</span>
          <select
            className="combobox combobox--full-width"
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
    const pursuerLabelId = `group-row-pursuer-heading-${this.id}`;

    return (
      <div className="GroupRow__section-container">
        <h2 id={pursuerLabelId} className="GroupRow__title">
          Pursuer(s)
        </h2>
        {currentGroup.pursuersIds.length > 0 ? (
          <ul aria-labelledby={pursuerLabelId}>
            {currentGroup.pursuersIds.map((pursuerId) => (
              <li key={pursuerId}>{pursuerId}</li>
            ))}
          </ul>
        ) : (
          <p className="centered error text--small">
            {GroupRow.NO_PURSUER_WARNING_MESSAGE}
          </p>
        )}
      </div>
    );
  }

  private renderMembers() {
    const { groups, ownedIndex, participants } = this.props;
    const currentGroup = groups[ownedIndex];

    this.lowestMovementRating = this.findLowestMovementRate();
    this.highestMovementRating = this.findHighestMovementRate();

    return (
      <div className="GroupRow__section-container">
        <h2 className="GroupRow__title">Members</h2>
        <div className="GroupRow__pursuer-movement">
          <p
            className={`text--small ${clsx(
              !this.areBoundariesEqual() && GroupRow.HIGHEST_MOVEMENT_CLASS_NAME
            )}`}
          >{`Highest MOV : ${this.highestMovementRating}`}</p>
          <p
            className={`text--small ${clsx(
              !this.areBoundariesEqual() && GroupRow.LOWEST_MOVEMENT_CLASS_NAME
            )}`}
          >{`Lowest MOV : ${this.lowestMovementRating}`}</p>
        </div>
        {currentGroup.participants.length > 0 ? (
          <ul className="list" aria-label="Members">
            {currentGroup.participants.map((participant) => (
              <li
                className={`${this.getBoundaryClassName(
                  participant
                )} list__item`}
                key={participant.id}
              >
                {participant.name}
                <span>{participant.movementRate}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="centered error text--small">
            {GroupRow.NO_MEMBER_WARNING_MESSAGE}
          </p>
        )}
        <Button
          className="button button--primary button--medium"
          onClick={this.handleAddClick}
          disabled={!participants || participants.length < 1}
        >
          ADD
        </Button>
      </div>
    );
  }

  private renderParticipantModal() {
    const { participants } = this.props;
    const { modalShown } = this.state;

    const availableParticipants = participants?.filter(this.isAvailable) || [];

    return (
      <Modal
        className="Modal__Content"
        overlayClassName="Modal__Overlay"
        contentLabel="Select Participant(s)"
        isOpen={modalShown}
        onRequestClose={this.closeModal}
      >
        <h2 className="Modal__Content__text">
          Select Participant(s) To Add To Group
        </h2>
        <hr />
        <form onSubmit={this.handleSubmit}>
          {availableParticipants.length > 0 ? (
            availableParticipants.map((participant) => (
              <label className="checkbox" key={participant.id}>
                <span>
                  <input
                    className="checkbox__input"
                    type="checkbox"
                    value={participant.id}
                    onChange={this.handleCheckboxChange}
                  />
                  <span className="checkbox__checkmark">
                    <span className="material-icons" aria-hidden>
                      check
                    </span>
                  </span>
                </span>
                <span className="input__label">{participant.name}</span>
              </label>
            ))
          ) : (
            <p>{GroupRow.NO_AVAILABLE_PARTICIPANT_WARNING_MESSAGE}</p>
          )}
          <hr />
          <div className="Modal__Content__options">
            <Button
              className="button button--secondary button--medium"
              onClick={this.closeModal}
            >
              CANCEL
            </Button>
            <Button
              className="button button--primary button--medium"
              type="submit"
              disabled={!(availableParticipants.length > 0)}
            >
              ADD
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  render() {
    const { ownedIndex, groups } = this.props;

    return (
      <div
        className="GroupRow"
        tabIndex={0}
        role="gridcell"
        aria-label={`${groups[ownedIndex].name} Editor`}
      >
        {this.renderMainContent()}
        {this.renderExpandedContent()}
        {this.renderParticipantModal()}
      </div>
    );
  }
}
