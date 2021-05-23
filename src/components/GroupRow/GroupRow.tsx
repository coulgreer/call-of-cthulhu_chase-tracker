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
  hasDistancer: boolean;
  selectedParticipantsIds: string[];
  expansionShown: boolean;
  modalShown: boolean;
}

export default class GroupRow extends React.Component<Props, State> {
  static getInvalidDistancerId() {
    return "N/A";
  }

  static getDefaultChaseName() {
    return "DEFAULT Chase";
  }

  static getNoDistancerWarningMessage() {
    return "No appetite for the hunt? In due time it will come. It always does...";
  }

  static getNoPursuerWarningMessage() {
    return "These little birds fly free. They haven't noticed, yet.";
  }

  static getNoMemberWarningMessage() {
    return "An emptiness, yet to be filled. This *thing* lacks purpose.";
  }

  static getNoAvailableParticipantWarningMessage() {
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

  static get PLACEHOLDER_MEMBER_NAME() {
    return "---";
  }

  static get PLACEHOLDER_MEMBER_MOVEMENT_RATE() {
    return "N/A";
  }

  private id;

  private lowestMovementRateMember: Participant | null;

  private highestMovementRateMember: Participant | null;

  constructor(props: Props) {
    super(props);

    this.state = {
      hasDistancer: true,
      selectedParticipantsIds: [],
      expansionShown: false,
      modalShown: false,
    };

    this.id = nanoid();

    this.lowestMovementRateMember = null;
    this.highestMovementRateMember = null;

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
    this.renderParticipantCheckbox = this.renderParticipantCheckbox.bind(this);
    this.renderOption = this.renderOption.bind(this);
    this.renderMember = this.renderMember.bind(this);
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
    this.setState({ hasDistancer: this.hasDistancer() });
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
    selectedParticipants.forEach((participant) => {
      // eslint-disable-next-line no-param-reassign
      participant.isGrouped = true;
    });

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

    if (this.areBoundariesEqual()) return "";

    if (this.isHighestBoundary(movementRate)) {
      return GroupRow.HIGHEST_MOVEMENT_CLASS_NAME;
    }

    if (this.isLowestBoundary(movementRate)) {
      return GroupRow.LOWEST_MOVEMENT_CLASS_NAME;
    }

    return "";
  }

  private closeModal() {
    this.setState({ modalShown: false });
  }

  private findMemberWithHighestMovementRate() {
    const { groups, ownedIndex } = this.props;
    const { participants } = groups[ownedIndex];

    if (participants.length <= 0) return null;

    let result = participants[0];

    participants.forEach((participant) => {
      if (participant.movementRate > result.movementRate) result = participant;
    });

    return result;
  }

  private findMemberWithLowestMovementRate() {
    const { groups, ownedIndex } = this.props;
    const { participants } = groups[ownedIndex];

    if (participants.length <= 0) return null;

    let result = participants[0];

    participants.forEach((participant) => {
      if (participant.movementRate < result.movementRate) result = participant;
    });

    return result;
  }

  private findParticipantById(id: string) {
    const { participants } = this.props;

    if (!participants) return undefined;

    const index = participants.findIndex(
      (participant) => id === participant.id
    );

    return participants[index];
  }

  private hasBoundaryMovementRate(participant: Participant) {
    const { movementRate } = participant;

    return (
      this.isHighestBoundary(movementRate) ||
      this.isLowestBoundary(movementRate)
    );
  }

  private areBoundariesEqual() {
    return this.highestMovementRateMember === this.lowestMovementRateMember;
  }

  private isHighestBoundary(movementRate: number) {
    if (!this.highestMovementRateMember) return false;

    return this.highestMovementRateMember.movementRate === movementRate;
  }

  private isLowestBoundary(movementRate: number) {
    if (!this.lowestMovementRateMember) return false;

    return this.lowestMovementRateMember.movementRate === movementRate;
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

  private hasDistancer() {
    const { ownedIndex, groups } = this.props;
    const { distancerId } = groups[ownedIndex];

    return distancerId !== GroupRow.getInvalidDistancerId();
  }

  private hasValidParticipantCount() {
    const { participants } = this.props;

    return participants && participants.length > 0;
  }

  private hasPursuers() {
    const { ownedIndex, groups } = this.props;
    const { pursuersIds } = groups[ownedIndex];

    return pursuersIds.length > 0;
  }

  private hasMembers() {
    const { groups, ownedIndex } = this.props;
    const { participants } = groups[ownedIndex];

    return participants.length > 0;
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

  private renderParticipantModal() {
    const { participants } = this.props;
    const { modalShown } = this.state;

    const availableParticipants = participants?.filter(this.isAvailable) || [];

    return (
      <Modal
        className="Modal__Content"
        overlayClassName="Modal__Overlay"
        contentLabel="Select Participant"
        isOpen={modalShown}
        onRequestClose={this.closeModal}
      >
        <h2 className="Modal__Content__text">
          Select Participant To Add To Group
        </h2>
        <hr />
        <form onSubmit={this.handleSubmit}>
          {availableParticipants.length > 0 ? (
            availableParticipants.map(this.renderParticipantCheckbox)
          ) : (
            <p>{GroupRow.getNoAvailableParticipantWarningMessage()}</p>
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

  private static renderChaseName() {
    return (
      <div className="GroupRow__section-container">
        <h2 className="GroupRow__title" aria-label="Chase name">
          Chase Name: <em>{GroupRow.getDefaultChaseName()}</em>
        </h2>
      </div>
    );
  }

  private renderDistancer() {
    const { groups } = this.props;
    const { hasDistancer } = this.state;

    const warningMessageId = `distancer-combobox-warning-${this.id}`;

    return (
      <div className="GroupRow__section-container">
        <label>
          <span className="input__label">Distancer</span>
          <select
            className="combobox combobox--full-width"
            onBlur={this.handleDistancerBlur}
            aria-describedby={hasDistancer ? undefined : warningMessageId}
          >
            <option key="default" value={GroupRow.getInvalidDistancerId()}>
              [N/A]
            </option>
            {groups.map(this.renderOption)}
          </select>
        </label>
        <p
          id={warningMessageId}
          className="centered error text--small"
          hidden={hasDistancer}
        >
          {GroupRow.getNoDistancerWarningMessage()}
        </p>
      </div>
    );
  }

  private renderPursuers() {
    const { ownedIndex, groups } = this.props;
    const { pursuersIds } = groups[ownedIndex];

    const pursuerLabelId = `pursuers-heading-${this.id}`;
    const warningMessageId = `pursuers-list-warning-${this.id}`;

    return (
      <div className="GroupRow__section-container">
        <h2
          id={pursuerLabelId}
          className="GroupRow__title"
          aria-describedby={this.hasPursuers() ? undefined : warningMessageId}
        >
          Pursuers
        </h2>
        {this.hasPursuers() ? (
          <ul aria-labelledby={pursuerLabelId}>
            {pursuersIds.map(GroupRow.renderPursuer)}
          </ul>
        ) : (
          <p id={warningMessageId} className="centered error text--small">
            {GroupRow.getNoPursuerWarningMessage()}
          </p>
        )}
      </div>
    );
  }

  private renderMembers() {
    const { groups, ownedIndex } = this.props;
    const currentGroup = groups[ownedIndex];
    const { participants: currentParticipants } = currentGroup;

    const warningId = `member-table-warning-${this.id}`;

    this.highestMovementRateMember = this.findMemberWithHighestMovementRate();
    this.lowestMovementRateMember = this.findMemberWithLowestMovementRate();

    return (
      <div className="GroupRow__section-container">
        <table
          className="GroupRow__table"
          aria-describedby={this.hasMembers() ? undefined : warningId}
        >
          <caption>
            <h2 className="GroupRow__title">Members</h2>
          </caption>
          <thead>
            <tr
              className={clsx(
                !this.areBoundariesEqual() &&
                  GroupRow.HIGHEST_MOVEMENT_CLASS_NAME
              )}
              aria-label="Member with the highest MOV"
            >
              <td className="material-icons-outlined">arrow_upward</td>
              <td>
                {this.highestMovementRateMember?.name ||
                  GroupRow.PLACEHOLDER_MEMBER_NAME}
              </td>
              <td>
                {this.highestMovementRateMember?.movementRate ||
                  GroupRow.PLACEHOLDER_MEMBER_MOVEMENT_RATE}
              </td>
            </tr>
            <tr
              className={clsx(
                !this.areBoundariesEqual() &&
                  GroupRow.LOWEST_MOVEMENT_CLASS_NAME
              )}
              aria-label="Member with the lowest MOV"
            >
              <td className="material-icons-outlined">arrow_downward</td>
              <td className="GroupRow__cell--summarize">
                {this.lowestMovementRateMember?.name ||
                  GroupRow.PLACEHOLDER_MEMBER_NAME}
              </td>
              <td>
                {this.lowestMovementRateMember?.movementRate ||
                  GroupRow.PLACEHOLDER_MEMBER_MOVEMENT_RATE}
              </td>
            </tr>
            <tr className="GroupRow__header">
              <th aria-label="icon" />
              <th>Name</th>
              <th>MOV</th>
            </tr>
          </thead>
          <tbody aria-label="All Members">
            {this.hasMembers()
              ? currentParticipants.map(this.renderMember)
              : GroupRow.renderMemberWarning(warningId)}
          </tbody>
        </table>
        <Button
          className="button button--primary button--medium"
          onClick={this.handleAddClick}
          disabled={!this.hasValidParticipantCount()}
        >
          ADD
        </Button>
      </div>
    );
  }

  private renderOption(group: Group, index: number) {
    const { ownedIndex } = this.props;

    return (
      ownedIndex !== index && (
        <option key={group.id} value={group.id}>
          {group.name}
        </option>
      )
    );
  }

  private static renderPursuer(pursuerId: string) {
    return <li key={pursuerId}>{pursuerId}</li>;
  }

  private renderMember(participant: Participant) {
    return (
      <tr
        className={`${this.getBoundaryClassName(participant)}`}
        aria-label={participant.name}
        key={participant.id}
      >
        <td
          className={`material-icons-outlined GroupRow__icon ${clsx({
            "GroupRow__icon--hidden": !this.hasBoundaryMovementRate(
              participant
            ),
          })}`}
          aria-hidden={!this.hasBoundaryMovementRate(participant)}
        >
          warning
        </td>
        <td className="GroupRow__cell--summarize GroupRow__cell--fill-horizontal">
          {participant.name}
        </td>
        <td>{participant.movementRate}</td>
      </tr>
    );
  }

  private static renderMemberWarning(warningId: string) {
    return (
      <tr>
        <td id={warningId} className="centered error text--small" colSpan={3}>
          {GroupRow.getNoMemberWarningMessage()}
        </td>
      </tr>
    );
  }

  private renderParticipantCheckbox({ id, name }: Participant) {
    return (
      <label className="checkbox" key={id}>
        <span>
          <input
            className="checkbox__input"
            type="checkbox"
            value={id}
            onChange={this.handleCheckboxChange}
          />
          <span className="checkbox__checkmark">
            <span className="material-icons" aria-hidden>
              check
            </span>
          </span>
        </span>
        <span className="input__label">{name}</span>
      </label>
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
