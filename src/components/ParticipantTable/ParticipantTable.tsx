import * as React from "react";

import { Button, Fab, Grid, Paper, Typography } from "@material-ui/core";

import ParticipantContainer from "../ParticipantContainer";

import { createMuiConfirmationModal } from "../Modal";

import "./ParticipantTable.css";

import { Participant } from "../../types";
import UniqueSequenceGenerator from "../../utils/unique-sequence-generator";

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

export default class ParticipantTable extends React.Component<Props, State> {
  private static minimumParticipants = 1;

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
        name: `Participant #${idNum}`,
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
      <Fab
        color="secondary"
        className="fab"
        aria-label="Create Participant"
        onClick={this.handleCreateParticipantClick}
      >
        <span className="material-icons" aria-hidden>
          add
        </span>
      </Fab>
    );
  }

  private renderRemovalModal() {
    const { modalShown } = this.state;

    return (
      modalShown &&
      createMuiConfirmationModal(
        "Would You Like To Delete This Participant?",
        modalShown,
        this.closeModal,
        "Confirm Removal",
        { text: "CANCEL", onClick: this.handleCancelParticipantDeletingClick },
        { text: "DELETE", onSubmit: this.handleDeleteParticipantClick }
      )
    );
  }

  private renderMainContent() {
    const {
      participants,
      warningMessage = "No participants exist in this table",
    } = this.props;

    const participantGrid = (
      <Grid container spacing={2} role="grid" aria-label="Participants">
        {participants.map((participant) => (
          <Grid item role="row" key={participant.id}>
            <Paper>
              <Grid container>
                <Grid
                  item
                  xs
                  role="gridcell"
                  aria-label={`${participant.name} editor`}
                >
                  <ParticipantContainer
                    participant={participant}
                    onParticipantChange={this.handleParticipantChange}
                  />
                </Grid>
                <Grid
                  container
                  item
                  alignItems="stretch"
                  justifyContent="flex-end"
                  xs={3}
                  role="gridcell"
                >
                  <Button
                    color="primary"
                    variant="contained"
                    aria-label={`Remove: ${participant.id}`}
                    onClick={() =>
                      this.handleInitiateParticipantDeletingClick(participant)
                    }
                  >
                    <span className="material-icons" aria-hidden>
                      remove_circle
                    </span>
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );

    const warning = (
      <Typography role="alert" align="center" color="error">
        {warningMessage}
      </Typography>
    );

    return participants.length >= ParticipantTable.minimumParticipants
      ? participantGrid
      : warning;
  }

  render() {
    return (
      <div className="ParticipantTable">
        {this.renderMainContent()}
        {this.renderFloatingActionButton()}
        {this.renderRemovalModal()}
      </div>
    );
  }
}
