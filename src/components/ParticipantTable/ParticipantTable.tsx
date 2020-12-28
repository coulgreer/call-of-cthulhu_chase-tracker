import React from "react";

import ParticipantRow from "../ParticipantRow";
import AddIcon from "../../images/baseline_add_circle_outline_black_24dp.png";

interface ParticipantTableProps {
  warningMessage: string;
}

interface ParticipantTableState {
  participantRows: JSX.Element[];
}

export default class ParticipantTable extends React.Component<
  ParticipantTableProps,
  ParticipantTableState
> {
  private static datumCount = 0;

  constructor(props: ParticipantTableProps) {
    super(props);
    this.state = {
      participantRows: [],
    };
  }

  addParticipant() {
    ParticipantTable.datumCount++;

    let participantName = "Placeholder " + ParticipantTable.datumCount;
    let newRow = (
      <ParticipantRow key={participantName} participantName={participantName} />
    );

    this.setState((state) => ({
      participantRows: [...state.participantRows, newRow],
    }));
  }

  render() {
    const addButton = (
      <div>
        <button onClick={this.addParticipant.bind(this)}>
          <img src={AddIcon} alt="Add Participant" />
        </button>
      </div>
    );

    const displayArea =
      this.state.participantRows.length < 1 ? (
        <div>{this.props.warningMessage}</div>
      ) : (
        <div>{this.state.participantRows}</div>
      );

    return (
      <div>
        {addButton}
        {displayArea}
      </div>
    );
  }
}
