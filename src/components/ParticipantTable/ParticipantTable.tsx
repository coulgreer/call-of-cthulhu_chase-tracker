import React from "react";

import ParticipantRow from "../ParticipantRow";
import Modal from "../Modal";

import AddIcon from "../../images/baseline_add_circle_outline_black_24dp.png";
import RemoveIcon from "../../images/baseline_remove_circle_outline_black_24dp.png";

import "./index.css";

interface ParticipantTableProps {
  warningMessage: string;
}

interface ParticipantTableState {
  participantRows: JSX.Element[];
  isModalShown: boolean;
}

export default class ParticipantTable extends React.Component<
  ParticipantTableProps,
  ParticipantTableState
> {
  private static MINIMUM_PARTICIPANTS = 1;
  private datumCount = 0;

  constructor(props: ParticipantTableProps) {
    super(props);
    this.state = {
      participantRows: [],
      isModalShown: false,
    };
  }

  addParticipant() {
    this.datumCount++;

    let participantName = "Placeholder " + this.datumCount;
    let newRow = (
      <ParticipantRow
        key={"data " + participantName}
        participantName={participantName}
      />
    );

    this.setState((state) => ({
      participantRows: [...state.participantRows, newRow],
    }));
  }

  removeParticipant(component: JSX.Element) {
    const index = this.state.participantRows.indexOf(component);
    const newArray = this.state.participantRows;
    newArray.splice(index, 1);

    this.setState(() => ({
      participantRows: newArray,
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
      this.state.participantRows.length <
      ParticipantTable.MINIMUM_PARTICIPANTS ? (
        <p>{this.props.warningMessage}</p>
      ) : (
        this.state.participantRows.map((row) => (
          <div className="row" key={"row-control " + row.key}>
            {row}
            <button onClick={this.removeParticipant.bind(this, row)}>
              <img src={RemoveIcon} alt={"Remove " + row.key} />
            </button>
          </div>
        ))
      );

    const modalTitle = <p>Confirm Participant Deletion</p>;
    const modalBody = <p>Would you like to delete this participant?</p>;

    return (
      <div>
        {addButton}
        <div className="rows">{displayArea}</div>
        <Modal
          isShown={this.state.isModalShown}
          title={modalTitle}
          body={modalBody}
        />
      </div>
    );
  }
}
