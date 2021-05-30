import React from "react";

import clsx from "clsx";
import { Transition, animated } from "react-spring/renderprops";
import Modal from "react-modal";
import { nanoid } from "nanoid";

import Button from "../Button";

import "./GroupContainer.css";

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
  newMemberModalShown: boolean;
  mergeGroupModalShown: boolean;
}

export default class GroupContainer extends React.Component<Props, State> {
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
    return "GroupContainer--highest";
  }

  static get LOWEST_MOVEMENT_CLASS_NAME() {
    return "GroupContainer--lowest";
  }

  static get EXPANSION_PREFIX() {
    return "group-container-expansion";
  }

  static get PLACEHOLDER_MEMBER_NAME() {
    return "---";
  }

  static get PLACEHOLDER_MEMBER_MOVEMENT_RATE() {
    return "N/A";
  }

  private id;

  private currentGroup;

  private lowestMovementRateMember: Participant | null;

  private highestMovementRateMember: Participant | null;

  constructor(props: Props) {
    super(props);

    const { groups, ownedIndex } = this.props;

    this.state = {
      hasDistancer: true,
      selectedParticipantsIds: [],
      expansionShown: false,
      newMemberModalShown: false,
      mergeGroupModalShown: false,
    };

    this.id = nanoid();
    this.currentGroup = groups[ownedIndex];

    this.lowestMovementRateMember = null;
    this.highestMovementRateMember = null;

    // Event handlers
    this.handleExpandClick = this.handleExpandClick.bind(this);
    this.handleDistancerBlur = this.handleDistancerBlur.bind(this);
    this.handleOpenAddMemberModalClick =
      this.handleOpenAddMemberModalClick.bind(this);
    this.handleOpenMergeGroupModalClick =
      this.handleOpenMergeGroupModalClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.closeNewMemberModal = this.closeNewMemberModal.bind(this);
    this.closeMergeGroupModal = this.closeMergeGroupModal.bind(this);

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
    const { groups, onDistancerBlur } = this.props;
    const { value } = event.currentTarget;
    const distancer = groups.find((group) => group.id === value);

    if (onDistancerBlur) onDistancerBlur(this.currentGroup, distancer);
    this.setState({ hasDistancer: this.hasDistancer() });
  }

  private handleOpenAddMemberModalClick() {
    this.setState({ newMemberModalShown: true });
  }

  private handleOpenMergeGroupModalClick() {
    this.setState({ mergeGroupModalShown: true });
  }

  private handleSubmit() {
    const { onSubmit } = this.props;
    const { selectedParticipantsIds } = this.state;
    const { participants: currentParticipants } = this.currentGroup;

    const selectedParticipants = selectedParticipantsIds
      .map(this.findParticipantById)
      .filter((participant): participant is Participant => !!participant);
    selectedParticipants.forEach((participant) => {
      // eslint-disable-next-line no-param-reassign
      participant.isGrouped = true;
    });

    this.currentGroup.participants =
      selectedParticipants.concat(currentParticipants);

    if (onSubmit) onSubmit(this.currentGroup);

    this.setState({ selectedParticipantsIds: [] });

    this.closeNewMemberModal();
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
      return GroupContainer.HIGHEST_MOVEMENT_CLASS_NAME;
    }

    if (this.isLowestBoundary(movementRate)) {
      return GroupContainer.LOWEST_MOVEMENT_CLASS_NAME;
    }

    return "";
  }

  private closeNewMemberModal() {
    this.setState({ newMemberModalShown: false });
  }

  private closeMergeGroupModal() {
    this.setState({ mergeGroupModalShown: false });
  }

  private findMemberWithHighestMovementRate() {
    const { participants } = this.currentGroup;

    if (participants.length <= 0) return null;

    let result = participants[0];

    participants.forEach((participant) => {
      if (participant.movementRate > result.movementRate) result = participant;
    });

    return result;
  }

  private findMemberWithLowestMovementRate() {
    const { participants } = this.currentGroup;

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

    const { participants: ownedParticipants } = this.currentGroup;
    let isAvailable = true;

    ownedParticipants.forEach((ownedParticipant) => {
      if (ownedParticipant.id === participant.id) isAvailable = false;
    });

    return isAvailable;
  }

  private hasDistancer() {
    const { distancerId } = this.currentGroup;

    return distancerId !== GroupContainer.getInvalidDistancerId();
  }

  private hasValidParticipantCount() {
    const { participants } = this.props;

    return participants && participants.length > 0;
  }

  private hasPursuers() {
    const { pursuersIds } = this.currentGroup;

    return pursuersIds.length > 0;
  }

  private hasMembers() {
    const { participants } = this.currentGroup;

    return participants.length > 0;
  }

  private renderMainContent() {
    const { name } = this.currentGroup;
    const { expansionShown } = this.state;

    return (
      <div className="GroupContainer__main-container">
        <div className="GroupContainer__merge-control-container">
          <Button className="button button--small button--secondary">
            SPLIT
          </Button>
          <Button
            className="button button--small button--secondary"
            onClick={this.handleOpenMergeGroupModalClick}
          >
            JOIN
          </Button>
        </div>
        <label>
          <span className="input__label">Name</span>
          <input className="textbox textbox--full-width" defaultValue={name} />
        </label>
        <Button
          className="button button--primary button--small button--circular"
          aria-label="Group Details"
          aria-expanded={expansionShown}
          aria-controls={`${GroupContainer.EXPANSION_PREFIX}-${this.id}`}
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
              id={`${GroupContainer.EXPANSION_PREFIX}-${this.id}`}
              style={props}
              className="GroupContainer__extended-container"
            >
              {GroupContainer.renderChaseName()}
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
    const { newMemberModalShown } = this.state;

    const availableParticipants = participants?.filter(this.isAvailable) || [];

    return (
      <Modal
        className="Modal__Content"
        overlayClassName="Modal__Overlay"
        contentLabel="Select Participant"
        isOpen={newMemberModalShown}
        onRequestClose={this.closeNewMemberModal}
      >
        <h2 className="Modal__Content__text">
          Select Participant To Add To Group
        </h2>
        <hr />
        <form onSubmit={this.handleSubmit}>
          {availableParticipants.length > 0 ? (
            availableParticipants.map(this.renderParticipantCheckbox)
          ) : (
            <p>{GroupContainer.getNoAvailableParticipantWarningMessage()}</p>
          )}
          <hr />
          <div className="Modal__Content__options">
            <Button
              className="button button--secondary button--medium"
              onClick={this.closeNewMemberModal}
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

  private renderMergeModal() {
    const { groups } = this.props;
    const { mergeGroupModalShown } = this.state;
    const { id: currentId } = this.currentGroup;
    const headerId = `merge-modal-header-${this.id}`;

    return (
      <Modal
        className="Modal__Content"
        overlayClassName="Modal__Overlay"
        isOpen={mergeGroupModalShown}
        onRequestClose={this.closeMergeGroupModal}
        aria={{ labelledby: headerId }}
      >
        <h2 id={headerId}>Select Merging Group</h2>
        <div>
          {groups
            .filter((group) => currentId !== group.id)
            .map(GroupContainer.renderMergeableGroupCheckbox)}
        </div>
        <div>
          <Button>CANCEL</Button>
          <Button>JOIN</Button>
        </div>
      </Modal>
    );
  }

  private static renderChaseName() {
    return (
      <div className="GroupContainer__section-container">
        <h2 className="GroupContainer__title" aria-label="Chase name">
          Chase Name: <em>{GroupContainer.getDefaultChaseName()}</em>
        </h2>
      </div>
    );
  }

  private renderDistancer() {
    const { groups } = this.props;
    const { hasDistancer } = this.state;

    const warningMessageId = `distancer-combobox-warning-${this.id}`;

    return (
      <div className="GroupContainer__section-container">
        <label>
          <span className="input__label">Distancer</span>
          <select
            className="combobox combobox--full-width"
            onBlur={this.handleDistancerBlur}
            aria-describedby={hasDistancer ? undefined : warningMessageId}
          >
            <option
              key="default"
              value={GroupContainer.getInvalidDistancerId()}
            >
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
          {GroupContainer.getNoDistancerWarningMessage()}
        </p>
      </div>
    );
  }

  private renderPursuers() {
    const { pursuersIds } = this.currentGroup;

    const pursuerLabelId = `pursuers-heading-${this.id}`;
    const warningMessageId = `pursuers-list-warning-${this.id}`;

    return (
      <div className="GroupContainer__section-container">
        <h2
          id={pursuerLabelId}
          className="GroupContainer__title"
          aria-describedby={this.hasPursuers() ? undefined : warningMessageId}
        >
          Pursuers
        </h2>
        {this.hasPursuers() ? (
          <ul aria-labelledby={pursuerLabelId}>
            {pursuersIds.map(GroupContainer.renderPursuer)}
          </ul>
        ) : (
          <p id={warningMessageId} className="centered error text--small">
            {GroupContainer.getNoPursuerWarningMessage()}
          </p>
        )}
      </div>
    );
  }

  private renderMembers() {
    const { participants: currentParticipants } = this.currentGroup;

    const warningId = `member-table-warning-${this.id}`;

    this.highestMovementRateMember = this.findMemberWithHighestMovementRate();
    this.lowestMovementRateMember = this.findMemberWithLowestMovementRate();

    return (
      <div className="GroupContainer__section-container">
        <table
          className="GroupContainer__table"
          aria-describedby={this.hasMembers() ? undefined : warningId}
        >
          <caption>
            <h2 className="GroupContainer__title">Members</h2>
          </caption>
          <thead>
            <tr
              className={clsx(
                !this.areBoundariesEqual() &&
                  GroupContainer.HIGHEST_MOVEMENT_CLASS_NAME
              )}
              aria-label="Member with the highest MOV"
            >
              <td className="material-icons-outlined">arrow_upward</td>
              <td>
                {this.highestMovementRateMember?.name ||
                  GroupContainer.PLACEHOLDER_MEMBER_NAME}
              </td>
              <td>
                {this.highestMovementRateMember?.movementRate ||
                  GroupContainer.PLACEHOLDER_MEMBER_MOVEMENT_RATE}
              </td>
            </tr>
            <tr
              className={clsx(
                !this.areBoundariesEqual() &&
                  GroupContainer.LOWEST_MOVEMENT_CLASS_NAME
              )}
              aria-label="Member with the lowest MOV"
            >
              <td className="material-icons-outlined">arrow_downward</td>
              <td className="GroupContainer__cell--summarize">
                {this.lowestMovementRateMember?.name ||
                  GroupContainer.PLACEHOLDER_MEMBER_NAME}
              </td>
              <td>
                {this.lowestMovementRateMember?.movementRate ||
                  GroupContainer.PLACEHOLDER_MEMBER_MOVEMENT_RATE}
              </td>
            </tr>
            <tr className="GroupContainer__header">
              <th aria-label="icon" />
              <th>Name</th>
              <th>MOV</th>
            </tr>
          </thead>
          <tbody aria-label="All Members">
            {this.hasMembers()
              ? currentParticipants.map(this.renderMember)
              : GroupContainer.renderMemberWarning(warningId)}
          </tbody>
        </table>
        <Button
          className="button button--primary button--medium"
          onClick={this.handleOpenAddMemberModalClick}
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
          className={`material-icons-outlined GroupContainer__icon ${clsx({
            "GroupContainer__icon--hidden":
              !this.hasBoundaryMovementRate(participant),
          })}`}
          aria-hidden={!this.hasBoundaryMovementRate(participant)}
        >
          warning
        </td>
        <td className="GroupContainer__cell--summarize GroupContainer__cell--fill-horizontal">
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
          {GroupContainer.getNoMemberWarningMessage()}
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

  private static renderMergeableGroupCheckbox({ name }: Group) {
    return (
      <label>
        <input type="radio" />
        {name}
      </label>
    );
  }

  render() {
    const { name } = this.currentGroup;

    return (
      <div
        className="GroupContainer"
        tabIndex={0}
        role="gridcell"
        aria-label={`${name} Editor`}
      >
        {this.renderMainContent()}
        {this.renderExpandedContent()}
        {this.renderParticipantModal()}
        {this.renderMergeModal()}
      </div>
    );
  }
}
