import React from "react";

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
  selectedGroupIndex: number;
}

export default class GroupTable extends React.Component<Props, State> {
  private sequenceGenerator;

  static get DEFAULT_WARNING_MESSAGE() {
    return "No participants exist in this table";
  }

  constructor(props: Props) {
    super(props);

    this.state = {
      groups: [],
      selectedGroupIndex: -1,
    };

    this.sequenceGenerator = new UniqueSequenceGen(0);

    this.handleCreateClick = this.handleCreateClick.bind(this);
    this.handleDistancerBlur = this.handleDistancerBlur.bind(this);
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

  private handleRemoveClick(id: string) {
    this.setState((state) => {
      const { groups } = state;
      const targetIndex = groups.findIndex((group) => group.id === id);

      const groupId = groups[targetIndex].id;
      const results = groupId.match(new RegExp(/\d+$/)) || [];
      const result = results[0];

      this.sequenceGenerator.remove(Number.parseInt(result, 10));
      groups.splice(targetIndex, 1);

      return { groups };
    });
  }

  private handleDistancerBlur(current: Group, newDistancer: Group | undefined) {
    const oldDistancerId = current.distancerId;

    if (oldDistancerId !== GroupRow.INVALID_DISTANCER_ID) {
      this.updateOldDistancer(current.id, oldDistancerId);
    }

    this.update(current.id, newDistancer?.id);
  }

  private handleKeyDown(selectedIndex: number) {
    this.setState({ selectedGroupIndex: selectedIndex });
  }

  private updateOldDistancer(currentGroupId: string, oldDistancerId: string) {
    this.setState((state) => {
      const { groups } = state;

      const oldDistancerIndex = groups.findIndex(
        (group) => group.id === oldDistancerId
      );
      const oldDistancer = groups[oldDistancerIndex];

      const { pursuersIds } = oldDistancer;
      const currentIndex = pursuersIds.findIndex(
        (pursuerId) => pursuerId === currentGroupId
      );

      oldDistancer.pursuersIds.splice(currentIndex, 1);

      return { groups };
    });
  }

  private update(currentId: string, newDistancerId: string | undefined) {
    this.setState((state) => {
      const { groups } = state;

      const currentIndex = groups.findIndex((group) => group.id === currentId);
      groups[currentIndex].distancerId =
        newDistancerId || GroupRow.INVALID_DISTANCER_ID;

      const newDistancerIndex = groups.findIndex(
        (group) => group.id === newDistancerId
      );
      groups[newDistancerIndex].pursuersIds.push(currentId);

      return { groups };
    });
  }

  private renderWarning() {
    const { warningMessage = GroupTable.DEFAULT_WARNING_MESSAGE } = this.props;

    return <p className="centered">{warningMessage}</p>;
  }

  private renderRows() {
    const { groups, selectedGroupIndex } = this.state;

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
          onKeyDown={() => this.handleKeyDown(index)}
          ownedIndex={index}
          groups={groups}
          isFocused={index === selectedGroupIndex}
        />
        <div role="gridcell">
          <Button
            className="GroupTable__row-control button button--primary"
            onClick={() => this.handleRemoveClick(group.id)}
          >
            <img src={RemoveIcon} alt={`Remove ${group.id}`} />
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
      </section>
    );
  }
}
