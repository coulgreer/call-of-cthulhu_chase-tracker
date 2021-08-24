import React, { Component } from "react";
import Modal from "react-modal";

import ParticipantContainer from "../ParticipantContainer";
import Button from "../Button";

import "./ParticipantTable.css";

import { Participant } from "../../types";
import UniqueSequenceGenerator from "../../utils/unique-sequence-generator";

if (process.env.NODE_ENV !== "test") Modal.setAppElement("#___gatsby");

interface Props {
  participants: Participant[];
  warningMessage?: string;
  onParticipantsChange?: (p: Participant[]) => void;
}

interface State {
  modalShown: boolean;
  selectedParticipant: Participant | null;
}

const SEQUENCE_START = 0;

export default class ParticipantTable extends Component<Props, State> {
  private static minimumParticipants = 1;

  static get DEFAULT_NAME() {
    return "Participant";
  }

  static get DEFAULT_WARNING_MESSAGE() {
    return "No participants exist in this table";
  }

  private participantSequence;

  constructor(props: Props) {
    super(props);
    this.state = {
      modalShown: false,
      selectedParticipant: null,
    };

    this.participantSequence = new UniqueSequenceGenerator(SEQUENCE_START);

    this.handleParticipantChange = this.handleParticipantChange.bind(this);
    this.handleCreateParticipantClick =
      this.handleCreateParticipantClick.bind(this);
    this.handleDeleteParticipantClick =
      this.handleDeleteParticipantClick.bind(this);
    this.handleCancelParticipantDeletingClick =
      this.handleCancelParticipantDeletingClick.bind(this);

    this.closeModal = this.closeModal.bind(this);
  }

  private handleParticipantChange(target: Participant) {
    const { participants, onParticipantsChange } = this.props;

    const targetIndex = participants.findIndex(({ id }) => id === target.id);
    participants.splice(targetIndex, 1, target);

    if (onParticipantsChange) onParticipantsChange([...participants]);
  }

  private handleCreateParticipantClick() {
    const { participants, onParticipantsChange } = this.props;
    const idNum = this.participantSequence.nextNum();

    const newParticipants = [
      ...participants,
      {
        id: `PARTICIPANT-${idNum}`,
        name: `${ParticipantTable.DEFAULT_NAME} #${idNum}`,
        dexterity: 15,
        movementRate: 2,
        speedModifier: 1,
        derivedSpeed: 3,
        actionCount: 1,
        speedStatistics: ParticipantContainer.DEFAULT_SPEED_STATISTICS,
        hazardStatistics: ParticipantContainer.DEFAULT_HAZARD_STATISTICS,
        isGrouped: false,
      },
    ];

    if (onParticipantsChange) onParticipantsChange(newParticipants);
  }

  private handleDeleteParticipantClick() {
    const { participants, onParticipantsChange } = this.props;
    const { selectedParticipant } = this.state;

    if (selectedParticipant) {
      const newParticipants = this.removeParticipant(
        participants,
        selectedParticipant
      );

      if (onParticipantsChange) onParticipantsChange(newParticipants);
    }

    this.closeModal();
  }

  private handleCancelParticipantDeletingClick() {
    this.setState({ modalShown: false, selectedParticipant: null });
  }

  private handleInitiateParticipantDeletingClick(participant: Participant) {
    this.setState({
      modalShown: true,
      selectedParticipant: participant,
    });
  }

  private closeModal() {
    this.setState({ modalShown: false });
  }

  private removeParticipant(
    participants: Participant[],
    participant: Participant
  ) {
    const newParticipants = [...participants];
    const targetIndex = newParticipants.indexOf(participant);
    const results = participant.id.match(/participant-\d+/i);

    if (!results) {
      throw Error(
        `The given participant ID -- ${participant.id} -- should be formatted with trailing digits.`
      );
    }

    const result = results[0].replace(/participant-/i, "");
    this.participantSequence.remove(Number.parseInt(result, 10));
    newParticipants.splice(targetIndex, 1);

    return newParticipants;
  }

  private renderFloatingActionButton() {
    return (
      <Button
        className="button fab"
        aria-label="Create Participant"
        onClick={this.handleCreateParticipantClick}
      >
        <span className="material-icons" aria-hidden>
          add
        </span>
      </Button>
    );
  }

  private renderRemovalModal() {
    const { modalShown } = this.state;

    return (
      <Modal
        className="Modal"
        overlayClassName="Modal__Overlay"
        contentLabel="Confirm Removal"
        isOpen={modalShown}
        onRequestClose={this.closeModal}
      >
        <h2 className="Modal__header">
          Would You Like To Delete This Participant?
        </h2>
        <hr />
        <div className="Modal__options">
          <Button
            className="button button--contained button--on-dark button--medium"
            onClick={this.handleCancelParticipantDeletingClick}
          >
            CANCEL
          </Button>
          <Button
            className="button button--outlined button--on-dark button--medium"
            onClick={this.handleDeleteParticipantClick}
          >
            DELETE
          </Button>
        </div>
      </Modal>
    );
  }

  private renderWarningMessage() {
    const { warningMessage = ParticipantTable.DEFAULT_WARNING_MESSAGE } =
      this.props;

    return <p className="centered">{warningMessage}</p>;
  }

  private renderParticipants() {
    const { participants } = this.props;

    return participants.map((participant) => (
      <div className="ParticipantTable__row" role="row" key={participant.id}>
        <ParticipantContainer
          role="gridcell"
          aria-label={`${participant.name} editor`}
          participant={participant}
          onParticipantChange={this.handleParticipantChange}
        />
        <div role="gridcell">
          <Button
            className="ParticipantTable__row-control button button--contained button--on-dark"
            onClick={() =>
              this.handleInitiateParticipantDeletingClick(participant)
            }
            aria-label={`Remove: ${participant.id}`}
          >
            <span className="material-icons" aria-hidden>
              remove_circle
            </span>
          </Button>
        </div>
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
