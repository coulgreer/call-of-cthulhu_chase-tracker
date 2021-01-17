import React, { Component, ReactElement } from "react";
import Modal from "react-modal";

import ParticipantRow from "../ParticipantRow";

import AddIcon from "../../images/baseline_add_circle_outline_black_24dp.png";
import RemoveIcon from "../../images/baseline_remove_circle_outline_black_24dp.png";

import "./index.css";

if (process.env.NODE_ENV !== "test") Modal.setAppElement("#___gatsby");

interface Props {
  warningMessage: string;
}

interface State {
  participantRows: ReactElement[];
  isModalOpen: boolean;
  selectedRow: ReactElement | null;
}

const DEFAULT_NAME = "Participant";

export default class ParticipantTable extends Component<Props, State> {
  static get DEFAULT_NAME() {
    return DEFAULT_NAME;
  }

  private static minimumParticipants = 1;
  private datumCount = 0;

  constructor(props: Props) {
    super(props);
    this.state = {
      participantRows: [],
      isModalOpen: false,
      selectedRow: null,
    };

    this.addParticipant = this.addParticipant.bind(this);
    this.removeSelectedParticipant = this.removeSelectedParticipant.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  addParticipant() {
    this.datumCount++;

    const participantName = DEFAULT_NAME + this.datumCount;
    const newRow = (
      <ParticipantRow
        key={"data " + participantName}
        participantName={participantName}
      />
    );

    this.setState((state) => ({
      participantRows: [...state.participantRows, newRow],
    }));
  }

  promptParticipantRemoval(component: ReactElement) {
    this.setState(() => ({
      isModalOpen: true,
      selectedRow: component,
    }));
  }

  removeSelectedParticipant() {
    if (this.state.selectedRow) {
      const targetIndex = this.state.participantRows.indexOf(
        this.state.selectedRow
      );
      const modifiedParticipantRows = this.state.participantRows;
      modifiedParticipantRows.splice(targetIndex, 1);

      this.setState(() => ({
        participantRows: modifiedParticipantRows,
        selectedRow: null,
      }));
      this.closeModal();
    }
  }

  closeModal() {
    this.setState(() => ({ isModalOpen: false }));
  }

  render() {
    const addButtonElement = (
      <button onClick={this.addParticipant}>
        <img src={AddIcon} alt="Add Participant" />
      </button>
    );

    const rowsElement =
      this.state.participantRows.length <
      ParticipantTable.minimumParticipants ? (
        <p>{this.props.warningMessage}</p>
      ) : (
        this.state.participantRows.map((row) => (
          <div className="row" key={"row-control " + row.key}>
            {row}
            <button onClick={() => this.promptParticipantRemoval(row)}>
              <img src={RemoveIcon} alt={"Remove " + row.key} />
            </button>
          </div>
        ))
      );

    const modalElement = (
      <Modal
        contentLabel={"Confirm Removal"}
        isOpen={this.state.isModalOpen}
        onRequestClose={this.closeModal}
      >
        <p>Would you like to delete this participant?</p>
        <button onClick={this.removeSelectedParticipant}>Yes</button>
        <button onClick={this.closeModal}>Cancel</button>
      </Modal>
    );

    return (
      <div className="participant-table">
        <div>{addButtonElement}</div>
        <div className="rows">{rowsElement}</div>
        {modalElement}
      </div>
    );
  }
}
