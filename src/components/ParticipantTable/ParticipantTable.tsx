import React, { Component, ReactElement } from "react";
import Modal from "react-modal";

import ParticipantRow from "../ParticipantRow";
import Button from "../Button";

import AddIcon from "../../images/baseline_add_black_24dp_x2.png";
import RemoveIcon from "../../images/baseline_remove_circle_outline_black_24dp.png";

import "./ParticipantTable.css";

import UniqueSequenceGenerator from "../../utils/unique-sequence-generator";

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
    this.deleteSelectedParticipant = this.deleteSelectedParticipant.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  private deleteSelectedParticipant() {
    const { selectedRow } = this.state;

    if (selectedRow) {
      this.removeParticipantFromSequence(selectedRow);
      this.removeParticipantFromTable(selectedRow);
    }

    this.closeModal();
  }

  private createParticipant() {
    const idNum = this.sequnceGenerator.nextNum();
    const id = `${ParticipantTable.DEFAULT_NAME} #${idNum}`;
    const newRow = <ParticipantRow key={id} id={id} />;

    this.setState((state) => ({
      participantRows: [...state.participantRows, newRow],
    }));
  }

  private promptParticipantRemoval(row: ReactElement) {
    this.setState({
      modalShown: true,
      selectedRow: row,
    });
  }

  private removeParticipantFromSequence(row: ReactElement) {
    const idNum = Number.parseInt(row.props.id.match(/[0-9]+$/)[0], 10);
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
    this.setState({ modalShown: false });
  }

  private renderFloatingActionButton() {
    return (
      <Button className="button fab" onClick={this.createParticipant}>
        <img src={AddIcon} alt="Add Participant" />
      </Button>
    );
  }

  private renderRemovalModal() {
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
          Would you like to delete this participant?
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
            onClick={this.deleteSelectedParticipant}
          >
            DELETE
          </Button>
        </div>
      </Modal>
    );
  }

  private renderWarningMessage() {
    const { warningMessage } = this.props;

    return <p className="centered">{warningMessage}</p>;
  }

  private renderParticipants() {
    const { participantRows } = this.state;
    return participantRows.map((row) => (
      <div className="ParticipantTable__row" key={row.key}>
        {row}
        <Button
          className="ParticipantTable__row-control button button--primary"
          onClick={() => this.promptParticipantRemoval(row)}
        >
          <img src={RemoveIcon} alt={`Remove: ${row.key}`} />
        </Button>
      </div>
    ));
  }

  render() {
    const { participantRows } = this.state;

    const rowsElement =
      participantRows.length < ParticipantTable.minimumParticipants
        ? this.renderWarningMessage()
        : this.renderParticipants();

    return (
      <div className="ParticipantTable">
        <div className="ParticipantTable__rows">{rowsElement}</div>
        {this.renderFloatingActionButton()}
        {this.renderRemovalModal()}
      </div>
    );
  }
}
