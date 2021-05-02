import React, { Component } from "react";
import Modal from "react-modal";

import ParticipantRow from "../ParticipantRow";
import Button from "../Button";

import AddIcon from "../../images/add_black_24dp.svg";
import RemoveIcon from "../../images/remove_circle_black_24dp.svg";

import "./ParticipantTable.css";

import { Participant } from "../../types";

if (process.env.NODE_ENV !== "test") Modal.setAppElement("#___gatsby");

interface Props {
  participants: Participant[];
  warningMessage?: string;
  onCreateParticipantClick?: () => void;
  onDeleteParticipantClick?: (p: Participant) => void;
  onParticipantChange?: (p: Participant) => void;
}

interface State {
  modalShown: boolean;
  selectedParticipant: Participant | null;
}

export default class ParticipantTable extends Component<Props, State> {
  private static minimumParticipants = 1;

  static get DEFAULT_NAME() {
    return "Participant";
  }

  static get DEFAULT_WARNING_MESSAGE() {
    return "No participants exist in this table";
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      modalShown: false,
      selectedParticipant: null,
    };

    this.createParticipant = this.createParticipant.bind(this);
    this.deleteSelectedParticipant = this.deleteSelectedParticipant.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  private handleParticipantChange(target: Participant) {
    const { onParticipantChange } = this.props;

    if (onParticipantChange) onParticipantChange(target);
  }

  private createParticipant() {
    const { onCreateParticipantClick } = this.props;

    if (onCreateParticipantClick) onCreateParticipantClick();
  }

  private deleteSelectedParticipant() {
    const { onDeleteParticipantClick } = this.props;
    const { selectedParticipant } = this.state;

    if (onDeleteParticipantClick && selectedParticipant) {
      onDeleteParticipantClick(selectedParticipant);
    }

    this.setState({ selectedParticipant: null });

    this.closeModal();
  }

  private promptParticipantRemoval(participant: Participant) {
    this.setState({
      modalShown: true,
      selectedParticipant: participant,
    });
  }

  private closeModal() {
    this.setState({ modalShown: false });
  }

  private renderFloatingActionButton() {
    return (
      <Button className="button fab" onClick={this.createParticipant}>
        <img src={AddIcon} alt="Add Participant" width="44" />
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
    const {
      warningMessage = ParticipantTable.DEFAULT_WARNING_MESSAGE,
    } = this.props;

    return <p className="centered">{warningMessage}</p>;
  }

  private renderParticipants() {
    const { participants } = this.props;

    return participants.map((participant) => (
      <div className="ParticipantTable__row" role="row" key={participant.id}>
        <ParticipantRow
          participant={participant}
          onParticipantChange={() => this.handleParticipantChange(participant)}
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
    const { participants } = this.props;

    return (
      <div className="ParticipantTable">
        {participants.length < ParticipantTable.minimumParticipants ? (
          this.renderWarningMessage()
        ) : (
          <div
            className="ParticipantTable__rows"
            role="grid"
            aria-label="Participants"
          >
            {this.renderParticipants()}
          </div>
        )}
        {this.renderFloatingActionButton()}
        {this.renderRemovalModal()}
      </div>
    );
  }
}
