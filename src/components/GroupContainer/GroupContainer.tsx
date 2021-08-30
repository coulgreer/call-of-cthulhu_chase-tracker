import React from "react";

import classnames from "classnames";
import { nanoid } from "nanoid";

import { Transition, animated } from "react-spring/renderprops";

import Button from "../Button";

import "./GroupContainer.css";

import { Group, Participant } from "../../types";
import { createFormModal } from "../Modal";

interface Props {
  ownedIndex: number;
  groups: Group[];
  participants?: Participant[];
  onGroupChange?: (g: Group) => void;
}

interface State {
  hasDistancer: boolean;
  rawGroupName: string;
  validGroupName: string;
  selectedParticipantsIds: string[];
  expansionShown: boolean;
  addMemberModalShown: boolean;
  removeMemberModalShown: boolean;
}

export default class GroupContainer extends React.Component<Props, State> {
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
    this.currentGroup = groups[ownedIndex];
    this.state = {
      hasDistancer: true,
      rawGroupName: this.currentGroup.name,
      validGroupName: this.currentGroup.name,
      selectedParticipantsIds: [],
      expansionShown: false,
      addMemberModalShown: false,
      removeMemberModalShown: false,
    };

    this.id = nanoid();

    this.lowestMovementRateMember = null;
    this.highestMovementRateMember = null;

    this.handleToggleClick = this.handleToggleClick.bind(this);
    this.handleDistancerBlur = this.handleDistancerBlur.bind(this);
    this.handleParticipantCheckboxChange =
      this.handleParticipantCheckboxChange.bind(this);

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleNameBlur = this.handleNameBlur.bind(this);

    this.handleInitiateMemberAdditionClick =
      this.handleInitiateMemberAdditionClick.bind(this);
    this.handleCancelMemberAdditionClick =
      this.handleCancelMemberAdditionClick.bind(this);
    this.handleMemberAdditionSubmit =
      this.handleMemberAdditionSubmit.bind(this);

    this.handleInitiateMemberRemovalClick =
      this.handleInitiateMemberRemovalClick.bind(this);
    this.handleCancelMemberRemovalClick =
      this.handleCancelMemberRemovalClick.bind(this);
    this.handleMemberRemovalSubmit = this.handleMemberRemovalSubmit.bind(this);

    this.findParticipantById = this.findParticipantById.bind(this);
    this.isAvailable = this.isAvailable.bind(this);

    this.renderParticipantCheckbox = this.renderParticipantCheckbox.bind(this);
    this.renderOption = this.renderOption.bind(this);
    this.renderMember = this.renderMember.bind(this);
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    const { groups, ownedIndex } = props;
    const { validGroupName } = state;
    const tempGroup = groups[ownedIndex];

    if (tempGroup.name !== validGroupName) {
      return { rawGroupName: tempGroup.name, validGroupName: tempGroup.name };
    }

    return null;
  }

  private handleToggleClick() {
    this.setState((state) => ({
      expansionShown: !state.expansionShown,
    }));
  }

  private handleDistancerBlur(event: React.ChangeEvent<HTMLSelectElement>) {
    const { groups, onGroupChange } = this.props;
    const { value } = event.currentTarget;
    const { distancer: oldDistancer } = this.currentGroup;
    const newDistancer = groups.find(({ id }) => id === value) ?? null;

    this.removeDistancer();
    this.addDistancer(newDistancer);

    this.setState({ hasDistancer: this.hasDistancer() });

    if (onGroupChange) {
      onGroupChange(this.currentGroup);
      if (newDistancer) onGroupChange(newDistancer);
      if (oldDistancer) onGroupChange(oldDistancer);
    }
  }

  private handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.currentTarget;

    if (value) {
      this.currentGroup.name = value;
      this.setState({ validGroupName: value });
    }

    this.setState({ rawGroupName: value });
  }

  private handleNameBlur() {
    const { onGroupChange } = this.props;

    this.setState((state) => {
      if (onGroupChange) onGroupChange(this.currentGroup);

      return { rawGroupName: state.validGroupName };
    });
  }

  private handleInitiateMemberAdditionClick() {
    this.setState({ selectedParticipantsIds: [], addMemberModalShown: true });
  }

  private handleCancelMemberAdditionClick() {
    this.setState({ addMemberModalShown: false });
  }

  private handleMemberAdditionSubmit() {
    const { onGroupChange } = this.props;
    const { selectedParticipantsIds } = this.state;
    const { participants: currentParticipants } = this.currentGroup;

    const selectedParticipants = selectedParticipantsIds
      .map(this.findParticipantById)
      .filter((participant): participant is Participant => !!participant);

    selectedParticipants.forEach((participant) => {
      const p = participant;
      p.isGrouped = true;
    });
    currentParticipants.push(...selectedParticipants);

    if (onGroupChange) onGroupChange(this.currentGroup);

    this.handleCancelMemberAdditionClick();
  }

  private handleInitiateMemberRemovalClick() {
    this.setState({
      selectedParticipantsIds: [],
      removeMemberModalShown: true,
    });
  }

  private handleCancelMemberRemovalClick() {
    this.setState({ removeMemberModalShown: false });
  }

  private handleMemberRemovalSubmit() {
    const { onGroupChange } = this.props;
    const { selectedParticipantsIds } = this.state;
    const { participants: currentParticipants } = this.currentGroup;

    const selectedParticipants = selectedParticipantsIds
      .map(this.findParticipantById)
      .filter((participant): participant is Participant => !!participant);
    const selectedParticipantsIndices = selectedParticipantsIds
      .map((selectedParticipantId) =>
        currentParticipants.findIndex(({ id }) => selectedParticipantId === id)
      )
      .sort();

    selectedParticipants.forEach((participant) => {
      const p = participant;
      p.isGrouped = false;
    });
    selectedParticipantsIndices.forEach((index, i) => {
      currentParticipants.splice(index - i, 1);
    });

    if (onGroupChange) onGroupChange(this.currentGroup);

    this.handleCancelMemberRemovalClick();
  }

  private handleParticipantCheckboxChange(
    event: React.FormEvent<HTMLInputElement>
  ) {
    const { value, checked } = event.currentTarget;

    this.setState(({ selectedParticipantsIds }) => {
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

  private findParticipantById(targetId: string) {
    const { participants } = this.props;

    if (!participants) return undefined;

    return participants.find(({ id }) => targetId === id);
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

  private isAvailable({ id: targetId, isGrouped }: Participant) {
    if (isGrouped) return false;

    const { participants: ownedParticipants } = this.currentGroup;
    let isAvailable = true;

    ownedParticipants.forEach(({ id }) => {
      if (id === targetId) isAvailable = false;
    });

    return isAvailable;
  }

  private hasDistancer() {
    const { distancer } = this.currentGroup;

    return distancer !== null;
  }

  private hasValidParticipantCount() {
    const { participants } = this.props;

    return participants && participants.length > 0;
  }

  private hasPursuers() {
    const { pursuers } = this.currentGroup;

    return pursuers.length > 0;
  }

  private hasMembers() {
    const { participants } = this.currentGroup;

    return participants.length > 0;
  }

  private removeDistancer() {
    if (!this.currentGroup.distancer) return;

    const { onGroupChange } = this.props;
    const { id: currentGroupId, distancer: oldDistancer } = this.currentGroup;
    const { pursuers } = oldDistancer;
    const pursuerIndex = pursuers.findIndex(({ id }) => id === currentGroupId);

    pursuers.splice(pursuerIndex, 1);

    this.currentGroup.distancer = null;

    if (onGroupChange) onGroupChange(oldDistancer);
  }

  private addDistancer(distancer: Group | null) {
    this.currentGroup.distancer = distancer;

    if (distancer === null) return;

    distancer.pursuers.push(this.currentGroup);
  }

  private renderSummaryContent() {
    const { rawGroupName, expansionShown } = this.state;

    return (
      <div className="GroupContainer__main-container">
        <label>
          <span className="input__label">Name</span>
          <input
            className="textbox textbox--full-width"
            value={rawGroupName}
            onChange={this.handleNameChange}
            onBlur={this.handleNameBlur}
          />
        </label>
        <Button
          className="button button--contained button--on-dark button--small button--circular"
          aria-label="Group Details"
          aria-expanded={expansionShown}
          aria-controls={`${GroupContainer.EXPANSION_PREFIX}-${this.id}`}
          onClick={this.handleToggleClick}
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

  private renderMemberAdditionModal() {
    const { participants } = this.props;
    const { addMemberModalShown } = this.state;

    const availableParticipants = participants?.filter(this.isAvailable) ?? [];

    const Header = (
      <h2 className="Modal__header">Select Participant To Add To Group</h2>
    );
    const Content = (
      <form onSubmit={this.handleMemberAdditionSubmit}>
        <div className="Modal__body">
          {availableParticipants.length > 0 ? (
            availableParticipants.map(this.renderParticipantCheckbox)
          ) : (
            <p>{GroupContainer.getNoAvailableParticipantWarningMessage()}</p>
          )}
        </div>
        <div className="Modal__options">
          <Button
            className="button button--outlined button--on-dark button--medium"
            onClick={this.handleCancelMemberAdditionClick}
          >
            CANCEL
          </Button>
          <Button
            className="button button--text button--on-dark button--medium"
            type="submit"
            disabled={!(availableParticipants.length > 0)}
          >
            ADD
          </Button>
        </div>
      </form>
    );

    return (
      addMemberModalShown &&
      createFormModal(
        addMemberModalShown,
        "Select participants",
        Header,
        Content,
        this.handleCancelMemberAdditionClick
      )
    );
  }

  private renderMemberRemovalModal() {
    const { removeMemberModalShown } = this.state;
    const { participants } = this.currentGroup;

    const Header = <h2 className="Modal__header">Remove members from group</h2>;
    const Content = (
      <form onSubmit={this.handleMemberRemovalSubmit}>
        <div className="Modal__body">
          {participants.map(this.renderParticipantCheckbox)}
        </div>
        <div className="Modal__options">
          <Button
            className="button button--outlined button--on-dark button--medium"
            onClick={this.handleCancelMemberRemovalClick}
          >
            CANCEL
          </Button>
          <Button
            className="button button--text button--on-dark button--medium"
            type="submit"
          >
            REMOVE
          </Button>
        </div>
      </form>
    );

    return (
      removeMemberModalShown &&
      createFormModal(
        removeMemberModalShown,
        "Remove member",
        Header,
        Content,
        this.handleCancelMemberRemovalClick
      )
    );
  }

  private static renderChaseName() {
    return (
      <div className="GroupContainer__section-container">
        <h2 className="GroupContainer__title">
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
            <option key="default" value="default">
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
    const { pursuers } = this.currentGroup;

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
            {pursuers.map(GroupContainer.renderPursuer)}
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

    const highestMovementRowClasses = classnames({
      [GroupContainer.HIGHEST_MOVEMENT_CLASS_NAME]: !this.areBoundariesEqual(),
    });
    const lowestMovementRowClasses = classnames({
      [GroupContainer.LOWEST_MOVEMENT_CLASS_NAME]: !this.areBoundariesEqual(),
    });

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
              className={highestMovementRowClasses}
              aria-label="Member with the highest MOV"
            >
              <td className="material-icons-outlined">arrow_upward</td>
              <td className="GroupContainer__cell--summarize">
                {this.highestMovementRateMember?.name ||
                  GroupContainer.PLACEHOLDER_MEMBER_NAME}
              </td>
              <td>
                {this.highestMovementRateMember?.movementRate ||
                  GroupContainer.PLACEHOLDER_MEMBER_MOVEMENT_RATE}
              </td>
            </tr>
            <tr
              className={lowestMovementRowClasses}
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
          <tbody>
            {this.hasMembers()
              ? currentParticipants.map(this.renderMember)
              : GroupContainer.renderMemberWarning(warningId)}
          </tbody>
        </table>
        <div className="GroupContainer__button-list">
          <Button
            className="button button--outlined button--on-light button--small"
            onClick={this.handleInitiateMemberAdditionClick}
            disabled={!this.hasValidParticipantCount()}
          >
            ADD
          </Button>
          <Button
            className="button button--outlined button--on-light button--small"
            onClick={this.handleInitiateMemberRemovalClick}
            disabled={!this.hasMembers()}
          >
            REMOVE
          </Button>
        </div>
      </div>
    );
  }

  private renderOption({ id, name }: Group, index: number) {
    const { ownedIndex } = this.props;

    return (
      ownedIndex !== index && (
        <option key={id} value={id}>
          {name}
        </option>
      )
    );
  }

  private static renderPursuer({ id }: Group) {
    return <li key={id}>{id}</li>;
  }

  private renderMember(participant: Participant) {
    const iconClasses = classnames(
      "material-icons-outlined",
      "GroupContainer__icon",
      {
        "GroupContainer__icon--hidden":
          !this.hasBoundaryMovementRate(participant),
      }
    );

    return (
      <tr
        className={`${this.getBoundaryClassName(participant)}`}
        aria-label={participant.name}
        key={participant.id}
      >
        <td
          className={iconClasses}
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
            onChange={this.handleParticipantCheckboxChange}
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
    return (
      <div className="GroupContainer">
        {this.renderSummaryContent()}
        {this.renderExpandedContent()}
        {this.renderMemberAdditionModal()}
        {this.renderMemberRemovalModal()}
      </div>
    );
  }
}
