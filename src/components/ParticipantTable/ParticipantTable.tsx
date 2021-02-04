import React, { Component, ReactElement } from "react";
import Modal from "react-modal";

import ParticipantRow from "../ParticipantRow";
import Button from "../Button";

import UniqueSequenceGenerator from "../../utils/unique-sequence-generator";

import AddIcon from "../../images/baseline_add_black_36dp.png";
import RemoveIcon from "../../images/baseline_remove_circle_outline_black_24dp.png";

import "./ParticipantTable.css";

if (process.env.NODE_ENV !== "test") Modal.setAppElement("#___gatsby");

interface Props {
  warningMessage: string;
}

interface State {
  participantRows: ReactElement[];
  modalShown: boolean;
  selectedRow: ReactElement | null;
}

export default class ParticipantTable extends Component<Props, State> {
  private static minimumParticipants = 1;

  private static startingNumber = 0;

  static get DEFAULT_NAME() {
    return "Participant";
  }

  private sequnceGenerator;

  constructor(props: Props) {
    super(props);
    this.state = {
      participantRows: [],
      modalShown: false,
      selectedRow: null,
    };

    this.sequnceGenerator = new UniqueSequenceGenerator(
      ParticipantTable.startingNumber
    );

    this.createParticipant = this.createParticipant.bind(this);
    this.removeSelectedParticipant = this.removeSelectedParticipant.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  private createParticipant() {
    const idNum = this.sequnceGenerator.nextNum();

    const defaultParticipantName = `${ParticipantTable.DEFAULT_NAME} #${idNum}`;
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
      modalShown: true,
      selectedRow: row,
    }));
  }

  private removeSelectedParticipant() {
    const { selectedRow } = this.state;

    if (selectedRow) {
      this.removeParticipantFromSequence(selectedRow);
      this.removeParticipantFromTable(selectedRow);
    }

    this.closeModal();
  }

  private removeParticipantFromSequence(row: ReactElement) {
    const regex = new RegExp(/[0-9]$/gm);
    const idNum = Number.parseInt(
      row.props.defaultParticipantName.match(regex)[0],
      10
    );
    this.sequnceGenerator.remove(idNum);
  }

  private removeParticipantFromTable(row: ReactElement) {
    const { participantRows } = this.state;

    this.setState(() => {
      const targetIndex = participantRows.indexOf(row);
      participantRows.splice(targetIndex, 1);

      return { selectedRow: null };
    });
  }

  private closeModal() {
    this.setState(() => ({ modalShown: false }));
  }

  render() {
    const { warningMessage } = this.props;
    const { participantRows, modalShown } = this.state;

    const addButtonElement = (
      <Button className="button fab" onClick={this.createParticipant}>
        <img src={AddIcon} alt="Add Participant" />
      </Button>
    );

    const rowsElement =
      participantRows.length < ParticipantTable.minimumParticipants ? (
        <p className="centered">{warningMessage}</p>
      ) : (
        participantRows.map((row) => (
          <div className="ParticipantTable__row" key={row.key}>
            {row}
            <Button
              className="ParticipantTable__row-control button button--primary button--small"
              onClick={() => this.promptParticipantRemoval(row)}
            >
              <span className="button-overlay" />
              <img src={RemoveIcon} alt={`Remove: ${row.key}`} />
            </Button>
          </div>
        ))
      );

    const modalElement = (
      <Modal
        className="Modal__Content"
        contentLabel="Confirm Removal"
        isOpen={modalShown}
        onRequestClose={this.closeModal}
      >
        <p className="Modal__Content__text">
          Would you like to delete this participant?
        </p>
        <div className="Modal__Content__options">
          <Button
            className="button button--tertiary button--medium"
            onClick={this.closeModal}
          >
            <span className="button-overlay" />
            CANCEL
          </Button>
          <Button
            className="button button--secondary button--medium"
            onClick={this.removeSelectedParticipant}
          >
            <span className="button-overlay" />
            YES
          </Button>
        </div>
      </Modal>
    );

    return (
      <div className="ParticipantTable">
        {addButtonElement}
        <div className="ParticipantTable__rows">{rowsElement}</div>
        {modalElement}
      </div>
    );
  }
}
