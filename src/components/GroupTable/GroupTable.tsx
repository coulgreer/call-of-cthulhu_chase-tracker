import React from "react";
import Modal from "react-modal";

import GroupRow from "../GroupRow";
import Button from "../Button";

import AddIcon from "../../images/add_black_24dp.svg";
import RemoveIcon from "../../images/remove_circle_black_24dp.svg";

import "./GroupTable.css";

import UniqueSequenceGen from "../../utils/unique-sequence-generator";

import { Group, Participant } from "../../types";

interface Props {
  participants?: Participant[];
  warningMessage?: string;
}

interface State {
  groups: Group[];
  selectedIndex: number;
  modalShown: boolean;
}

export default class GroupTable extends React.Component<Props, State> {
  static get DEFAULT_WARNING_MESSAGE() {
    return "No participants exist in this table";
  }

  private sequenceGenerator;

  constructor(props: Props) {
    super(props);

    this.state = {
      groups: [],
      selectedIndex: -1,
      modalShown: false,
    };

    this.sequenceGenerator = new UniqueSequenceGen(0);

    this.handleCreateClick = this.handleCreateClick.bind(this);
    this.handleDistancerBlur = this.handleDistancerBlur.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleGroupChange = this.handleGroupChange.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  private handleCreateClick() {
    const idNum = this.sequenceGenerator.nextNum();

    this.setState((state) => {
      const { groups } = state;

      groups.push({
        id: `GROUP-${idNum}`,
        name: `Group ${idNum}`,
        distancerId: GroupRow.INVALID_DISTANCER_ID,
        pursuersIds: [],
        participants: [],
      });

      return { groups };
    });
  }

  private handlePromptDeleteClick(index: number) {
    this.setState({
      modalShown: true,
      selectedIndex: index,
    });
  }

  private handleDeleteClick() {
    this.setState((state) => {
      const { groups, selectedIndex } = state;

      const groupId = groups[selectedIndex].id;
      const results = groupId.match(new RegExp(/\d+$/)) || [];
      const result = results[0];

      this.sequenceGenerator.remove(Number.parseInt(result, 10));
      groups.splice(selectedIndex, 1);

      return { groups };
    });

    this.closeModal();
  }

  private handleDistancerBlur(target: Group, distancer: Group | undefined) {
    if (target.distancerId !== GroupRow.INVALID_DISTANCER_ID) {
      this.removeDistancerFrom(target);
    }

    this.addDistancer(target, distancer);
  }

  private handleGroupChange(newGroup: Group) {
    this.setState((state) => {
      const { groups } = state;

      const index = groups.findIndex((group) =>
        GroupTable.areGroupsEqual(group, newGroup)
      );

      groups.splice(index, 1, newGroup);

      return { groups };
    });
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

  private removeDistancerFrom({ id: targetId, distancerId }: Group) {
    this.setState((state) => {
      const { groups } = state;

      const distancerIndex = groups.findIndex((group) =>
        GroupTable.areGroupsEqual(group.id, distancerId)
      );
      const distancer = groups[distancerIndex];

      const { pursuersIds } = distancer;
      const currentIndex = pursuersIds.findIndex((pursuerId) =>
        GroupTable.areGroupsEqual(pursuerId, targetId)
      );

      distancer.pursuersIds.splice(currentIndex, 1);

      return { groups };
    });
  }

  private addDistancer({ id: targetId }: Group, distancer: Group | undefined) {
    const distancerId = distancer?.id || GroupRow.INVALID_DISTANCER_ID;

    this.setState((state) => {
      const { groups } = state;

      const targetIndex = groups.findIndex((group) =>
        GroupTable.areGroupsEqual(group.id, targetId)
      );
      groups[targetIndex].distancerId = distancerId;

      const distancerIndex = groups.findIndex((group) =>
        GroupTable.areGroupsEqual(group.id, distancerId)
      );
      groups[distancerIndex].pursuersIds.push(targetId);

      return { groups };
    });
  }

  private renderWarning() {
    const { warningMessage = GroupTable.DEFAULT_WARNING_MESSAGE } = this.props;

    return <p className="centered">{warningMessage}</p>;
  }

  private renderRows() {
    const { participants } = this.props;
    const { groups } = this.state;

    return groups.map((group, index) => (
      <div
        role="row"
        tabIndex={0}
        aria-label={group.id}
        className="GroupTable__row-container"
        key={group.id}
      >
        <GroupRow
          onDistancerBlur={this.handleDistancerBlur}
          handleSubmit={this.handleGroupChange}
          ownedIndex={index}
          groups={groups}
          participants={participants}
        />
        <div role="gridcell">
          <Button
            className="GroupTable__row-control button button--primary"
            onClick={() => this.handlePromptDeleteClick(index)}
          >
            <img src={RemoveIcon} alt={`Delete ${group.id}`} />
          </Button>
        </div>
      </div>
    ));
  }

  private renderFloatingActionButton() {
    return (
      <Button className="button fab" onClick={this.handleCreateClick}>
        <img src={AddIcon} alt="Create Group" width="44" />
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
        <p className="Modal__Content__text">
          Would you like to delete this group?
        </p>
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
    const { groups } = this.state;

    return (
      <section className="GroupTable">
        {groups.length > 0 ? (
          <div role="grid" className="GroupTable__container">
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
