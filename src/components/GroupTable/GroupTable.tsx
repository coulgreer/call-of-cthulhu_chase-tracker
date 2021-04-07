import React from "react";

import GroupRow from "../GroupRow";
import Button from "../Button";

import AddIcon from "../../images/baseline_add_black_24dp_x2.png";
import RemoveIcon from "../../images/baseline_remove_circle_outline_black_24dp.png";

import "./GroupTable.css";

import UniqueSequenceGen from "../../utils/unique-sequence-generator";

import { Group } from "../../types";

interface Props {
  warningMessage: string;
}

interface State {
  groups: Group[];
}

export default class GroupTable extends React.Component<Props, State> {
  private sequenceGenerator;

  constructor(props: Props) {
    super(props);

    this.state = {
      groups: [],
    };

    this.sequenceGenerator = new UniqueSequenceGen(0);

    this.handleCreateClick = this.handleCreateClick.bind(this);
  }

  private handleCreateClick() {
    const idNum = this.sequenceGenerator.nextNum();

    this.setState((state) => {
      const { groups } = state;

      groups.push({
        id: `GROUP-${idNum}`,
        name: `Group ${idNum}`,
        distancerName: GroupRow.INVALID_DISTANCER_NAME,
        pursuersNames: [],
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

  private renderWarning() {
    const { warningMessage } = this.props;

    return <p className="centered">{warningMessage}</p>;
  }

  private renderRows() {
    const { groups } = this.state;

    return groups.map((group, index) => (
      <div className="GroupTable__row" key={group.id}>
        <GroupRow ownedIndex={index} groups={groups} />
        <Button
          className="GroupTable__row-control button button--primary"
          onClick={() => this.handleRemoveClick(group.id)}
        >
          <img src={RemoveIcon} alt={`REMOVE ${group.id}`} />
        </Button>
      </div>
    ));
  }

  private renderFloatingActionButton() {
    return (
      <Button className="button fab" onClick={this.handleCreateClick}>
        <img src={AddIcon} alt="CREATE GROUP" />
      </Button>
    );
  }

  render() {
    const { groups } = this.state;

    return (
      <div className="GroupTable">
        <div className="GroupTable__rows">
          {groups.length > 0 ? this.renderRows() : this.renderWarning()}
        </div>
        {this.renderFloatingActionButton()}
      </div>
    );
  }
}
