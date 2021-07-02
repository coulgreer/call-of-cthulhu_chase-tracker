import React from "react";

import Modal from "react-modal";
import { nanoid } from "nanoid";

import GroupContainer from "../GroupContainer";
import Button from "../Button";

import "./GroupTable.css";

import { Group, Participant } from "../../types";

import UniqueSequenceGen from "../../utils/unique-sequence-generator";

interface Props {
  groups: Group[];
  participants?: Participant[];
  warningMessage?: string;
  onGroupsChange?: (g: Group[]) => void;
}

interface State {
  selectedIndex: number;
  deletingModalShown: boolean;
  splittingModalShown: boolean;
  combiningModalShown: boolean;
  selectedCombining: Group[];
  rawCombiningName: string | undefined;
  validCombiningName: string | undefined;
  originalMembers: Participant[];
  rawSplinteredGroupName: string;
  validSplinteredGroupName: string;
  splinteredMembers: Participant[];
}

const SEQUENCE_START = 0;

export default class GroupTable extends React.Component<Props, State> {
  static DEFAULT_SPLINTERED_NAME = "New Group";

  static getDefaultWarningMessage() {
    return "No groups exist in this table";
  }

  static getCombiningWarningMessage() {
    return "This process will remove the selected group and move its members into the initiating group.";
  }

  private id;

  private sequenceGenerator;

  constructor(props: Props) {
    super(props);

    this.state = {
      selectedIndex: -1,
      deletingModalShown: false,
      splittingModalShown: false,
      combiningModalShown: false,
      selectedCombining: [],
      rawCombiningName: undefined,
      validCombiningName: undefined,
      originalMembers: [],
      rawSplinteredGroupName: GroupTable.DEFAULT_SPLINTERED_NAME,
      validSplinteredGroupName: GroupTable.DEFAULT_SPLINTERED_NAME,
      splinteredMembers: [],
    };

    this.sequenceGenerator = new UniqueSequenceGen(SEQUENCE_START);

    this.id = nanoid();

    this.handleGroupChange = this.handleGroupChange.bind(this);
    this.handleCreationClick = this.handleCreationClick.bind(this);
    this.handleDeletingClick = this.handleDeletingClick.bind(this);
    this.handleCancelDeletingClick = this.handleCancelDeletingClick.bind(this);
    this.handleCombiningSubmit = this.handleCombiningSubmit.bind(this);
    this.handleCombiningGroupCheckboxChange =
      this.handleCombiningGroupCheckboxChange.bind(this);
    this.handleCombiningNameChange = this.handleCombiningNameChange.bind(this);
    this.handleCombiningNameBlur = this.handleCombiningNameBlur.bind(this);
    this.handleCancelCombiningClick =
      this.handleCancelCombiningClick.bind(this);
    this.handleCancelSplittingClick =
      this.handleCancelSplittingClick.bind(this);
    this.handleSplittingSubmit = this.handleSplittingSubmit.bind(this);
    this.handleNewGroupNameChange = this.handleNewGroupNameChange.bind(this);

    this.renderRow = this.renderRow.bind(this);
    this.renderCombinableGroupCheckbox =
      this.renderCombinableGroupCheckbox.bind(this);
    this.renderOriginalMemberRow = this.renderOriginalMemberRow.bind(this);
    this.renderNewMemberRow = this.renderNewMemberRow.bind(this);
  }

  private handleGroupChange(newGroup: Group) {
    const { groups, onGroupsChange } = this.props;

    const targetIndex = groups.findIndex((group) => group.id === newGroup.id);
    groups.splice(targetIndex, 1, newGroup);

    if (onGroupsChange) onGroupsChange([...groups]);
  }

  private handleCreationClick() {
    const { groups, onGroupsChange } = this.props;
    const idNum = this.sequenceGenerator.nextNum();
    const newGroups = [
      ...groups,
      {
        id: `GROUP-${idNum}`,
        name: `Group ${idNum}`,
        distancerId: GroupContainer.getInvalidGroupId(),
        pursuersIds: [],
        participants: [],
      },
    ];

    if (onGroupsChange) onGroupsChange(newGroups);
  }

  private handleDeletingClick() {
    const { onGroupsChange } = this.props;
    const { selectedIndex } = this.state;
    const newGroups = this.deleteGroups(selectedIndex);

    if (onGroupsChange) onGroupsChange(newGroups);

    this.closeDeletingModal();
  }

  private handleCancelDeletingClick() {
    this.setState({ deletingModalShown: false, selectedIndex: -1 });
  }

  private handleInitiateDeletingClick(index: number) {
    this.setState({
      deletingModalShown: true,
      selectedIndex: index,
    });
  }

  private handleSplittingSubmit() {
    const { groups, onGroupsChange } = this.props;
    const { validSplinteredGroupName, splinteredMembers } = this.state;
    const idNum = this.sequenceGenerator.nextNum();
    const newGroup = {
      id: `GROUP-${idNum}`,
      name: validSplinteredGroupName,
      distancerId: GroupContainer.getInvalidGroupId(),
      pursuersIds: [],
      participants: splinteredMembers,
    };

    /*
    TODO (Coul Greer): Do not allow user to create an empty group when
    splitting. This means that zero users in the new group should disable the
    committing button or should ignore the would-be, empty created group.
    */
    if (onGroupsChange) onGroupsChange([...groups, newGroup]);

    this.closeSplittingModal();
  }

  private handleCancelSplittingClick() {
    this.setState({
      splittingModalShown: false,
      selectedIndex: -1,
      originalMembers: [],
      splinteredMembers: [],
    });
  }

  private handleInitiateSplittingClick(index: number) {
    const { groups } = this.props;
    const selectedGroup = groups[index];

    this.setState({
      splittingModalShown: true,
      selectedIndex: index,
      originalMembers: selectedGroup.participants,
      splinteredMembers: [],
    });
  }

  private handleCombiningSubmit() {
    const { groups, onGroupsChange } = this.props;
    const { selectedIndex, selectedCombining, validCombiningName } = this.state;

    if (selectedCombining.length > 0) {
      const dominantGroup = groups[selectedIndex];
      const subservientGroups = selectedCombining;
      const mergingGroupIndices = selectedCombining.map((selectedGroup) =>
        groups.findIndex((group) => group.id === selectedGroup.id)
      );

      GroupTable.transferParticipants(dominantGroup, subservientGroups);
      if (validCombiningName) {
        dominantGroup.name = validCombiningName;
        this.setState({ validCombiningName: undefined });
      }
      const newGroups = this.deleteGroups(mergingGroupIndices);

      if (onGroupsChange) onGroupsChange(newGroups);
    }

    this.closeCombiningModal();
  }

  private handleCancelCombiningClick() {
    this.setState({ combiningModalShown: false, selectedIndex: -1 });
  }

  private handleInitiateCombiningClick(index: number) {
    const { groups } = this.props;
    const currentGroup = groups[index];
    const currentGroupName = currentGroup?.name ?? "";

    this.setState({
      combiningModalShown: true,
      selectedIndex: index,
      rawCombiningName: currentGroupName,
    });
  }

  private handleCombiningGroupCheckboxChange(
    event: React.FormEvent<HTMLInputElement>
  ) {
    const { groups } = this.props;
    const { value: mergingGroupId, checked } = event.currentTarget;

    this.setState((state) => {
      const { selectedCombining } = state;

      if (checked) {
        const mergingGroup = groups.find(
          (group) => mergingGroupId === group.id
        );

        if (mergingGroup) selectedCombining.push(mergingGroup);
      } else {
        const targetIndex = selectedCombining.findIndex(
          (group) => mergingGroupId === group.id
        );
        selectedCombining.splice(targetIndex, 1);
      }

      return { selectedCombining };
    });
  }

  private handleCombiningNameChange(event: React.FormEvent<HTMLInputElement>) {
    const { value } = event.currentTarget;
    const trimmedValue = value.trim();

    if (trimmedValue) this.setState({ validCombiningName: trimmedValue });

    this.setState({ rawCombiningName: value });
  }

  private handleCombiningNameBlur() {
    this.setState((state) => ({ rawCombiningName: state.validCombiningName }));
  }

  private handleOriginalMemberClick(transferedMember: Participant) {
    this.setState((state) => {
      const { originalMembers, splinteredMembers } = state;
      const index = originalMembers.findIndex(
        (member) => transferedMember.id === member.id
      );

      originalMembers.splice(index, 1);
      splinteredMembers.push(transferedMember);

      return { originalMembers, splinteredMembers };
    });
  }

  private handleNewMemberClick(transferedMember: Participant) {
    this.setState((state) => {
      const { originalMembers, splinteredMembers } = state;
      const index = splinteredMembers.findIndex(
        (member) => transferedMember.id === member.id
      );

      splinteredMembers.splice(index, 1);
      originalMembers.push(transferedMember);

      return { originalMembers, splinteredMembers };
    });
  }

  private handleNewGroupNameChange(event: React.FormEvent<HTMLInputElement>) {
    const { value } = event.currentTarget;

    if (value) this.setState({ validSplinteredGroupName: value });

    this.setState({ rawSplinteredGroupName: value });
  }

  /*
  TODO (Coul Greer): Check for order of class members to eliminate this issue
  or learn more about its working
  */
  static areGroupsEqual(group1: Group, group2: Group): boolean;
  static areGroupsEqual(groupId1: string, groupId2: string): boolean;
  // eslint-disable-next-line react/sort-comp
  static areGroupsEqual(g1: any, g2: any) {
    if (GroupTable.isGroup(g1) && GroupTable.isGroup(g2)) {
      return g1.id === g2.id;
    }

    return g1 === g2;
  }

  static isGroup(object: any): object is Group {
    return (object as Group).id !== undefined;
  }

  private static transferParticipants(
    dominantGroup: Group,
    subservientGroup: Group | Group[]
  ) {
    const transferParticipant = (group: Group) => {
      const { participants: dominantGroupsParticipants } = dominantGroup;
      const { participants: subservientGroupParticipants } = group;

      dominantGroupsParticipants.push(...subservientGroupParticipants);
    };

    if (Array.isArray(subservientGroup)) {
      subservientGroup.forEach(transferParticipant);
    } else {
      transferParticipant(subservientGroup);
    }
  }

  private closeDeletingModal() {
    this.setState((state) => ({ ...state, deletingModalShown: false }));
  }

  private closeSplittingModal() {
    this.setState({ splittingModalShown: false });
  }

  private closeCombiningModal() {
    this.setState((state) => ({ ...state, combiningModalShown: false }));
  }

  private deleteGroups(index: number | number[]) {
    const { groups } = this.props;
    const newGroups = [...groups];

    const deleteGroup = (i: number) => {
      const { id: groupId } = groups[i];
      const results = groupId.match(new RegExp(/\d+$/)) || [];
      const result = results[0];

      this.sequenceGenerator.remove(Number.parseInt(result, 10));
      newGroups.splice(i, 1);
    };

    if (Array.isArray(index)) {
      for (let i = 0; i < index.length; i += 1) {
        deleteGroup(index[i] - i);
      }
    } else {
      deleteGroup(index);
    }

    return newGroups;
  }

  private renderWarning() {
    const { warningMessage = GroupTable.getDefaultWarningMessage() } =
      this.props;

    return <p className="centered">{warningMessage}</p>;
  }

  private renderRows() {
    const { groups } = this.props;

    return (
      <div className="GroupTable__container" role="grid" aria-label="Groups">
        {groups.map(this.renderRow)}
      </div>
    );
  }

  private renderRow({ id, participants: members }: Group, index: number) {
    const { groups, participants } = this.props;

    return (
      <div
        className="GroupTable__row-container"
        tabIndex={0}
        role="row"
        aria-label={id}
        key={id}
      >
        <div role="gridcell">
          <div className="GroupContainer__merge-control-container">
            <Button
              className="button button--small button--outlined button--on-dark"
              disabled={members.length <= 1}
              onClick={() => this.handleInitiateSplittingClick(index)}
            >
              SPLIT
            </Button>
            <Button
              className="button button--small button--outlined button--on-dark"
              disabled={groups.length < 2}
              onClick={() => this.handleInitiateCombiningClick(index)}
            >
              COMBINE
            </Button>
          </div>
          <GroupContainer
            ownedIndex={index}
            groups={groups}
            participants={participants}
            onGroupChange={this.handleGroupChange}
          />
        </div>
        <div role="gridcell">
          <Button
            className="GroupTable__row-control button button--contained button--on-dark"
            aria-label={`Delete ${id}`}
            onClick={() => this.handleInitiateDeletingClick(index)}
          >
            <span className="material-icons" aria-hidden>
              remove_circle
            </span>
          </Button>
        </div>
      </div>
    );
  }

  private renderFloatingActionButton() {
    return (
      <Button
        className="button fab"
        aria-label="Create Group"
        onClick={this.handleCreationClick}
      >
        <span className="material-icons" aria-hidden>
          add
        </span>
      </Button>
    );
  }

  private renderDeletionModal() {
    const { deletingModalShown } = this.state;
    const headerId = `delete-modal-header-${this.id}`;

    return (
      <Modal
        className="Modal__Content"
        overlayClassName="Modal__Overlay"
        contentLabel="Confirm Removal"
        isOpen={deletingModalShown}
        onRequestClose={this.handleCancelDeletingClick}
        aria={{ labelledby: headerId }}
      >
        <h2 id={headerId} className="Modal__Content__text">
          Would you like to delete the selected group?
        </h2>
        <hr />
        <div className="Modal__Content__options">
          <Button
            className="button button--contained button--on-dark button--medium"
            onClick={this.handleCancelDeletingClick}
          >
            CANCEL
          </Button>
          <Button
            className="button button--outlined button--on-dark button--medium"
            onClick={this.handleDeletingClick}
          >
            DELETE
          </Button>
        </div>
      </Modal>
    );
  }

  private renderSplittingModal() {
    const { groups } = this.props;
    const {
      splittingModalShown,
      selectedIndex,
      originalMembers,
      splinteredMembers,
      rawSplinteredGroupName,
    } = this.state;
    const selectedGroup = groups[selectedIndex];
    const headerId = `split-modal-header-${this.id}`;
    const newNameInputId = `new-name-input-${this.id}`;

    return (
      selectedGroup && (
        <Modal
          className="Modal__Content"
          overlayClassName="Modal__Overlay"
          isOpen={splittingModalShown}
          onRequestClose={this.handleCancelSplittingClick}
          aria={{ labelledby: headerId }}
        >
          <h2 id={headerId}>Transfer members</h2>
          <form onSubmit={this.handleSplittingSubmit}>
            <div className="card card--dark">
              <h2>{selectedGroup.name}</h2>
              <div role="grid" aria-label={selectedGroup.name}>
                <div role="rowgroup" aria-label="members">
                  {originalMembers.map(this.renderOriginalMemberRow)}
                </div>
              </div>
            </div>
            <br />
            <div className="card card--dark">
              <label id={newNameInputId}>
                <span className="input__label">New group name</span>
                <input
                  className="textbox textbox--full-width"
                  value={rawSplinteredGroupName}
                  onChange={this.handleNewGroupNameChange}
                  type="text"
                />
              </label>
              <div role="grid" aria-labelledby={newNameInputId}>
                <div role="rowgroup" aria-label="members">
                  {splinteredMembers.length > 0
                    ? splinteredMembers.map(this.renderNewMemberRow)
                    : GroupTable.renderMemberPlaceholder()}
                </div>
              </div>
            </div>
            <div className="Modal__Content__options">
              <Button
                className="button button--medium button--on-dark button--outlined"
                onClick={this.handleCancelSplittingClick}
              >
                CANCEL
              </Button>
              <Button
                className="button button--text button--on-dark button--medium"
                disabled={splinteredMembers.length < 1}
                type="submit"
              >
                SPLIT
              </Button>
            </div>
          </form>
        </Modal>
      )
    );
  }

  private renderCombiningModal() {
    const { groups } = this.props;
    const {
      selectedIndex,
      combiningModalShown,
      rawCombiningName = "Default",
    } = this.state;
    const currentGroup = groups[selectedIndex];
    const headerId = `combine-modal-header-${this.id}`;

    return (
      currentGroup && (
        <Modal
          className="Modal__Content"
          overlayClassName="Modal__Overlay"
          isOpen={combiningModalShown}
          onRequestClose={this.handleCancelCombiningClick}
          aria={{ labelledby: headerId }}
        >
          <h2 id={headerId}>Would you like to merge the selected groups?</h2>
          <form onSubmit={this.handleCombiningSubmit}>
            <label>
              <span className="input__label">New Name</span>
              <input
                className="textbox textbox--full-width"
                type="text"
                value={rawCombiningName}
                onChange={this.handleCombiningNameChange}
                onBlur={this.handleCombiningNameBlur}
              />
            </label>
            <div>
              {groups
                .filter((group) => currentGroup.id !== group.id)
                .map(this.renderCombinableGroupCheckbox)}
            </div>
            <p className="text--small">
              {GroupTable.getCombiningWarningMessage()}
            </p>
            <div className="Modal__Content__options">
              <Button
                className="button button--outlined button--on-dark button--medium"
                onClick={this.handleCancelCombiningClick}
              >
                CANCEL
              </Button>
              <Button
                className="button button--text button--on-dark button--medium"
                type="submit"
              >
                COMBINE
              </Button>
            </div>
          </form>
        </Modal>
      )
    );
  }

  private renderCombinableGroupCheckbox({ id, name }: Group) {
    return (
      <label className="checkbox" key={id}>
        <input
          className="checkbox__input"
          type="checkbox"
          value={id}
          onChange={this.handleCombiningGroupCheckboxChange}
        />
        <span className="checkbox__checkmark">
          <span className="material-icons" aria-hidden>
            check
          </span>
        </span>
        <span className="input__label">{name}</span>
      </label>
    );
  }

  private static renderMemberPlaceholder() {
    return (
      <div
        className="GroupTable__row card card--dark"
        role="row"
        aria-label="placeholder"
      >
        <span role="gridcell">---</span>
        <span role="gridcell">
          <Button
            className="button button--small button--text button--on-dark"
            disabled
          >
            <span className="material-icons">block</span>
          </Button>
        </span>
      </div>
    );
  }

  private renderOriginalMemberRow(member: Participant) {
    const { originalMembers } = this.state;

    return (
      <div
        className="GroupTable__row card card--dark"
        key={member.id}
        role="row"
        aria-label={member.name}
      >
        <span role="gridcell">{member.name}</span>
        <span role="gridcell">
          <Button
            className="button button--small button--on-dark button--text"
            disabled={originalMembers.length < 2}
            aria-label={`Move ${member.name}`}
            onClick={() => this.handleOriginalMemberClick(member)}
          >
            <span className="material-icons" aria-hidden>
              arrow_downward
            </span>
          </Button>
        </span>
      </div>
    );
  }

  private renderNewMemberRow(member: Participant) {
    return (
      <div
        className="GroupTable__row card card--dark"
        key={member.id}
        role="row"
        aria-label={member.name}
      >
        <span role="gridcell">{member.name}</span>
        <span role="gridcell">
          <Button
            className="button button--small button--on-dark button--text"
            aria-label={`Move ${member.name}`}
            onClick={() => this.handleNewMemberClick(member)}
          >
            <span className="material-icons" aria-hidden>
              arrow_upward
            </span>
          </Button>
        </span>
      </div>
    );
  }

  render() {
    const { groups } = this.props;

    return (
      <section className="GroupTable">
        {groups.length > 0 ? this.renderRows() : this.renderWarning()}
        {this.renderFloatingActionButton()}
        {this.renderDeletionModal()}
        {this.renderSplittingModal()}
        {this.renderCombiningModal()}
      </section>
    );
  }
}
