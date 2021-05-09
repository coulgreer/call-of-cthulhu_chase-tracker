import React from "react";
import Modal from "react-modal";

import GroupRow from "../GroupRow";
import Button from "../Button";

import "./GroupTable.css";

import { Group, Participant } from "../../types";

interface Props {
  groups: Group[];
  participants?: Participant[];
  warningMessage?: string;
  onCreateGroupClick?: () => void;
  onDeleteGroupClick?: (i: number) => void;
  onGroupUpdate?: (g: Group) => void;
  onDistancerBlur?: (t: Group, d: Group | undefined) => void;
}

interface State {
  selectedIndex: number;
  modalShown: boolean;
}

export default class GroupTable extends React.Component<Props, State> {
  static get DEFAULT_WARNING_MESSAGE() {
    return "No groups exist in this table";
  }

  constructor(props: Props) {
    super(props);

    this.state = {
      selectedIndex: -1,
      modalShown: false,
    };

    this.handleCreateClick = this.handleCreateClick.bind(this);
    this.handleDistancerBlur = this.handleDistancerBlur.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleGroupUpdate = this.handleGroupUpdate.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  private handleCreateClick() {
    const { onCreateGroupClick } = this.props;

    if (onCreateGroupClick) onCreateGroupClick();
  }

  private handlePromptDeleteClick(index: number) {
    this.setState({
      modalShown: true,
      selectedIndex: index,
    });
  }

  private handleDeleteClick() {
    const { onDeleteGroupClick } = this.props;
    const { selectedIndex } = this.state;

    if (onDeleteGroupClick) onDeleteGroupClick(selectedIndex);

    this.closeModal();
  }

  private handleDistancerBlur(target: Group, distancer: Group | undefined) {
    const { onDistancerBlur } = this.props;

    if (onDistancerBlur) onDistancerBlur(target, distancer);
  }

  private handleGroupUpdate(newGroup: Group) {
    const { onGroupUpdate } = this.props;

    if (onGroupUpdate) onGroupUpdate(newGroup);
  }

  // TODO (Coul Greer): Check for order of class members to eliminate this issue or learn more about its working
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

  private closeModal() {
    this.setState({ modalShown: false });
  }

  private renderWarning() {
    const { warningMessage = GroupTable.DEFAULT_WARNING_MESSAGE } = this.props;

    return <p className="centered">{warningMessage}</p>;
  }

  private renderRows() {
    const { groups, participants } = this.props;

    return groups.map((group, index) => (
      <div
        className="GroupTable__row-container"
        tabIndex={0}
        role="row"
        aria-label={group.id}
        key={group.id}
      >
        <GroupRow
          onDistancerBlur={this.handleDistancerBlur}
          onSubmit={this.handleGroupUpdate}
          ownedIndex={index}
          groups={groups}
          participants={participants}
        />
        <div role="gridcell">
          <Button
            className="GroupTable__row-control button button--primary"
            aria-label={`Delete ${group.id}`}
            onClick={() => this.handlePromptDeleteClick(index)}
          >
            <span className="material-icons" aria-hidden>
              remove_circle
            </span>
          </Button>
        </div>
      </div>
    ));
  }

  private renderFloatingActionButton() {
    return (
      <Button
        className="button fab"
        aria-label="Create Group"
        onClick={this.handleCreateClick}
      >
        <span className="material-icons" aria-hidden>
          add
        </span>
      </Button>
    );
  }

  private renderDeletionModal() {
    const { modalShown } = this.state;

    return (
      <Modal
        className="Modal__Content"
        overlayClassName="Modal__Overlay"
        contentLabel="Confirm Removal"
        isOpen={modalShown}
        onRequestClose={this.closeModal}
      >
        <h2 className="Modal__Content__text">
          Would You Like To Delete This Group?
        </h2>
        <hr />
        <div className="Modal__Content__options">
          <Button
            className="button button--tertiary-on-dark button--medium"
            onClick={this.closeModal}
          >
            CANCEL
          </Button>
          <Button
            className="button button--secondary button--medium"
            onClick={this.handleDeleteClick}
          >
            DELETE
          </Button>
        </div>
      </Modal>
    );
  }

  render() {
    const { groups } = this.props;

    return (
      <section className="GroupTable">
        {groups.length > 0 ? (
          <div
            className="GroupTable__container"
            role="grid"
            aria-label="Groups"
          >
            {this.renderRows()}
          </div>
        ) : (
          this.renderWarning()
        )}
        {this.renderFloatingActionButton()}
        {this.renderDeletionModal()}
      </section>
    );
  }
}
