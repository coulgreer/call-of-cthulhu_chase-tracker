import React, { Component, ReactElement } from "react";
import Modal from "react-modal";

import ParticipantRow from "../ParticipantRow";

import UniqueSequenceGenerator from "../../utils/unique-sequence-generator";

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
  private static minimumParticipants = 1;
  private static startingNumber = 0;

  static get DEFAULT_NAME() {
    return DEFAULT_NAME;
  }

  private sequnceGenerator;

  constructor(props: Props) {
    super(props);
    this.state = {
      participantRows: [],
      isModalOpen: false,
      selectedRow: null,
    };

    this.sequnceGenerator = new UniqueSequenceGenerator(
      ParticipantTable.startingNumber
    );

    this.createParticipant = this.createParticipant.bind(this);
    this.removeSelectedParticipant = this.removeSelectedParticipant.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  render() {
    const addButtonElement = (
      <button onClick={this.createParticipant}>
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
              <img src={RemoveIcon} alt={"Remove: " + row.key} />
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

  private createParticipant() {
    const idNum = this.sequnceGenerator.nextNum();

    const defaultParticipantName = DEFAULT_NAME + " #" + idNum;
    const newRow = (
      <ParticipantRow
        key={defaultParticipantName}
        defaultParticipantName={defaultParticipantName}
      />
    );

    this.setState((state) => ({
      participantRows: [...state.participantRows, newRow],
    }));
  }

  private promptParticipantRemoval(row: ReactElement) {
    this.setState(() => ({
      isModalOpen: true,
      selectedRow: row,
    }));
  }

  private removeSelectedParticipant() {
    const selectedRow = this.state.selectedRow;

    if (selectedRow) {
      this.removeParticipantFromSequence(selectedRow);
      this.removeParticipantFromTable(selectedRow);
    }

    this.closeModal();
  }

  private removeParticipantFromSequence(row: ReactElement) {
    const regex = new RegExp(/[0-9]$/gm);
    const idNum = Number.parseInt(
      row.props.defaultParticipantName.match(regex)[0]
    );
    this.sequnceGenerator.remove(idNum);
  }

  private removeParticipantFromTable(row: ReactElement) {
    this.setState(() => {
      const targetIndex = this.state.participantRows.indexOf(row);
      this.state.participantRows.splice(targetIndex, 1);

      return {
        selectedRow: null,
      };
    });
  }

  private closeModal() {
    this.setState(() => ({ isModalOpen: false }));
  }
}
