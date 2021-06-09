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
  combiningModalShown: boolean;
  selectedCombining: Group | undefined;
}

const SEQUENCE_START = 0;

export default class GroupTable extends React.Component<Props, State> {
  static getDefaultWarningMessage() {
    return "No groups exist in this table";
  }

  private id;

  private sequenceGenerator;

  constructor(props: Props) {
    super(props);

    this.state = {
      selectedIndex: -1,
      deletingModalShown: false,
      combiningModalShown: false,
      selectedCombining: undefined,
    };

    this.id = nanoid();

    this.sequenceGenerator = new UniqueSequenceGen(SEQUENCE_START);

    this.handleGroupChange = this.handleGroupChange.bind(this);
    this.handleCreationClick = this.handleCreationClick.bind(this);
    this.handleDeletingClick = this.handleDeletingClick.bind(this);
    this.handleCancelDeletingClick = this.handleCancelDeletingClick.bind(this);
    this.handleCombiningSubmit = this.handleCombiningSubmit.bind(this);
    this.handleCombiningChange = this.handleCombiningChange.bind(this);
    this.handleCancelCombiningClick =
      this.handleCancelCombiningClick.bind(this);

    this.renderRow = this.renderRow.bind(this);
    this.renderCombinableGroupRadioButton =
      this.renderCombinableGroupRadioButton.bind(this);
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
    const newGroups = this.deleteGroup(selectedIndex);

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

  private handleCombiningSubmit() {
    const { groups, onGroupsChange } = this.props;
    const { selectedIndex, selectedCombining } = this.state;

    if (selectedCombining) {
      const dominantGroup = groups[selectedIndex];
      const subservientGroup = selectedCombining;
      const mergingGroupIndex = groups.findIndex(
        (group) => group.id === selectedCombining.id
      );

      GroupTable.transferParticipants(dominantGroup, subservientGroup);
      const newGroups = this.deleteGroup(mergingGroupIndex);

      if (onGroupsChange) onGroupsChange(newGroups);
    }

    this.closeCombiningModal();
  }

  private handleCancelCombiningClick() {
    this.setState({ combiningModalShown: false, selectedIndex: -1 });
  }

  private handleInitiateCombiningClick(index: number) {
    this.setState({ combiningModalShown: true, selectedIndex: index });
  }

  private handleCombiningChange(event: React.FormEvent<HTMLInputElement>) {
    const { groups } = this.props;
    const { value: mergingGroupId } = event.currentTarget;

    const mergingGroup = groups.find((group) => mergingGroupId === group.id);

    this.setState({ selectedCombining: mergingGroup });
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
    subservientGroup: Group
  ) {
    const { participants: dominantGroupsParticipants } = dominantGroup;
    const { participants: subservientGroupParticipants } = subservientGroup;

    dominantGroupsParticipants.push(...subservientGroupParticipants);
  }

  private closeDeletingModal() {
    this.setState((state) => ({ ...state, deletingModalShown: false }));
  }

  private closeCombiningModal() {
    this.setState((state) => ({ ...state, combiningModalShown: false }));
  }

  private deleteGroup(index: number) {
    const { groups } = this.props;
    const newGroups = [...groups];

    const { id: groupId } = groups[index];
    const results = groupId.match(new RegExp(/\d+$/)) || [];
    const result = results[0];

    this.sequenceGenerator.remove(Number.parseInt(result, 10));
    newGroups.splice(index, 1);

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

  private renderRow(group: Group, index: number) {
    const { groups, participants } = this.props;

    return (
      <div
        className="GroupTable__row-container"
        tabIndex={0}
        role="row"
        aria-label={group.id}
        key={group.id}
      >
        <div role="gridcell">
          <div className="GroupContainer__merge-control-container">
            <Button className="button button--small button--secondary">
              SPLIT
            </Button>
            <Button
              className="button button--small button--secondary"
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
            className="GroupTable__row-control button button--primary"
            aria-label={`Delete ${group.id}`}
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

    return (
      <Modal
        className="Modal__Content"
        overlayClassName="Modal__Overlay"
        contentLabel="Confirm Removal"
        isOpen={deletingModalShown}
        onRequestClose={this.handleCancelDeletingClick}
      >
        <h2 className="Modal__Content__text">
          Would You Like To Delete This Group?
        </h2>
        <hr />
        <div className="Modal__Content__options">
          <Button
            className="button button--tertiary-on-dark button--medium"
            onClick={this.handleCancelDeletingClick}
          >
            CANCEL
          </Button>
          <Button
            className="button button--secondary button--medium"
            onClick={this.handleDeletingClick}
          >
            DELETE
          </Button>
        </div>
      </Modal>
    );
  }

  private renderCombiningModal() {
    const { groups } = this.props;
    const { selectedIndex, combiningModalShown } = this.state;
    const currentId =
      groups[selectedIndex]?.id || GroupContainer.getInvalidGroupId();
    const headerId = `combine-modal-header-${this.id}`;

    return (
      <Modal
        className="Modal__Content"
        overlayClassName="Modal__Overlay"
        isOpen={combiningModalShown}
        onRequestClose={this.handleCancelCombiningClick}
        aria={{ labelledby: headerId }}
      >
        <h2 id={headerId}>Select Merging Group</h2>
        <form onSubmit={this.handleCombiningSubmit}>
          <div>
            {groups
              .filter((group) => currentId !== group.id)
              .map(this.renderCombinableGroupRadioButton)}
          </div>
          <div>
            <Button onClick={this.handleCancelCombiningClick}>CANCEL</Button>
            <Button type="submit">COMBINE</Button>
          </div>
        </form>
      </Modal>
    );
  }

  private renderCombinableGroupRadioButton({ id, name }: Group) {
    return (
      <label>
        <input type="radio" value={id} onChange={this.handleCombiningChange} />
        {name}
      </label>
    );
  }

  render() {
    const { groups } = this.props;

    return (
      <section className="GroupTable">
        {groups.length > 0 ? this.renderRows() : this.renderWarning()}
        {this.renderFloatingActionButton()}
        {this.renderDeletionModal()}
        {this.renderCombiningModal()}
      </section>
    );
  }
}
