import React, { Component } from "react";
import Modal from "react-modal";

import ParticipantRow from "../ParticipantRow";
import Button from "../Button";

import AddIcon from "../../images/baseline_add_black_24dp_x2.png";
import RemoveIcon from "../../images/baseline_remove_circle_outline_black_24dp.png";

import "./ParticipantTable.css";

import UniqueSequenceGenerator from "../../utils/unique-sequence-generator";

import { Participant } from "../../types";

if (process.env.NODE_ENV !== "test") Modal.setAppElement("#___gatsby");

interface Props {
  warningMessage: string;
}

interface State {
  modalShown: boolean;
  selectedParticipant: Participant | null;
  participants: Participant[];
}

const SEQUENCE_START = 0;

export default class ParticipantTable extends Component<Props, State> {
  private static minimumParticipants = 1;

  static get DEFAULT_NAME() {
    return "Participant";
  }

  private sequnceGenerator;

  constructor(props: Props) {
    super(props);
    this.state = {
      participants: [],
      modalShown: false,
      selectedParticipant: null,
    };

    this.sequnceGenerator = new UniqueSequenceGenerator(SEQUENCE_START);

    this.createParticipant = this.createParticipant.bind(this);
    this.deleteSelectedParticipant = this.deleteSelectedParticipant.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  private onParticipantChange(target: Participant) {
    this.setState((state) => {
      const { participants } = state;
      const targetIndex = participants.findIndex(
        (participant) => participant.id === target.id
      );

      participants[targetIndex] = target;

      return { participants };
    });
  }

  private deleteSelectedParticipant() {
    const { selectedParticipant } = this.state;

    if (selectedParticipant) {
      this.removeParticipantFromSequence(selectedParticipant);
      this.removeParticipantFromTable(selectedParticipant);
    }

    this.closeModal();
  }

  private createParticipant() {
    const idNum = this.sequnceGenerator.nextNum();
    const id = `${ParticipantTable.DEFAULT_NAME} #${idNum}`;

    this.setState((state) => {
      const { participants } = state;

      participants.push({
        id,
        name: id,
        dexterity: 15,
        movementRate: 2,
        derivedSpeed: 0,
        speedSkills: ParticipantRow.DEFAULT_SPEED_STATISTICS,
        hazardSkills: ParticipantRow.DEFAULT_HAZARD_STATISTICS,
      });

      return { participants };
    });
  }

  private promptParticipantRemoval(participant: Participant) {
    this.setState({
      modalShown: true,
      selectedParticipant: participant,
    });
  }

  private removeParticipantFromSequence(participant: Participant) {
    const results = participant.id.match(/[0-9]+$/);

    if (!results) {
      throw Error(
        `The given participant ID -- ${participant.id} -- should be formatted with trailing digits.`
      );
    }

    const idNum = Number.parseInt(results[0], 10);
    this.sequnceGenerator.remove(idNum);
  }

  private removeParticipantFromTable(participant: Participant) {
    this.setState((state) => {
      const { participants } = state;
      const targetIndex = participants.indexOf(participant);

      participants.splice(targetIndex, 1);

      return { selectedParticipant: null };
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
    const { participants } = this.state;
    return participants.map((participant) => (
      <div className="ParticipantTable__row" key={participant.id}>
        <ParticipantRow
          participant={participant}
          onParticipantChange={() => this.onParticipantChange(participant)}
        />
        <Button
          className="ParticipantTable__row-control button button--primary"
          onClick={() => this.promptParticipantRemoval(participant)}
        >
          <img src={RemoveIcon} alt={`Remove: ${participant.id}`} />
        </Button>
      </div>
    ));
  }

  render() {
    const { participants } = this.state;

    const rowsElement =
      participants.length < ParticipantTable.minimumParticipants
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
