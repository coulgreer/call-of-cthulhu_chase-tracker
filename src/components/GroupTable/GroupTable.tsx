import React from "react";

import GroupRow, { Data } from "../GroupRow";
import Button from "../Button";

import UniqueSequenceGen from "../../utils/unique-sequence-generator";

interface Props {
  warningMessage: string;
}

interface State {
  groups: Data[];
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
    const { groups } = this.state;
    const idNum = this.sequenceGenerator.nextNum();

    groups.push({
      id: `GROUP-${idNum}`,
      name: `Group ${idNum}`,
      distancerName: "",
      pursuerNames: [],
    });

    this.setState({ groups });
  }

  private handleRemoveClick(id: string) {
    const { groups } = this.state;
    const targetIndex = groups.findIndex((group) => group.id === id);

    const groupId = groups[targetIndex].id;
    const results = groupId.match(new RegExp(/\d+$/)) || [];
    const result = results[0];
    this.sequenceGenerator.remove(Number.parseInt(result, 10));

    groups.splice(targetIndex, 1);

    this.setState({ groups });
  }

  private renderWarning() {
    const { warningMessage } = this.props;

    return <p>{warningMessage}</p>;
  }

  private renderRows() {
    const { groups } = this.state;

    return groups.map((group, index) => (
      <div className="GroupTable__row-control">
        <GroupRow ownedIndex={index} groups={groups} />
        <Button onClick={() => this.handleRemoveClick(group.id)}>
          REMOVE {group.id}
        </Button>
      </div>
    ));
  }

  private renderAddButton() {
    return <Button onClick={this.handleCreateClick}>CREATE GROUP</Button>;
  }

  render() {
    const { groups } = this.state;

    return (
      <div>
        {groups.length > 0 ? this.renderRows() : this.renderWarning()}
        {this.renderAddButton()}
      </div>
    );
  }
}
