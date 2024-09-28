import * as React from "react";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";

import { nanoid } from "nanoid";

import StatisticTable from "../StatisticTable";
import { WrappedStatistic } from "../StatisticDisplay";
import DisplayFactory from "../StatisticDisplay/DisplayFactory";

import ChaseStartContext from "../../contexts/ChaseStartContext";

import "./ParticipantContainer.css";

import UniqueSequenceGenerator from "../../utils/unique-sequence-generator";
import { roll, Result } from "../../utils/roller";
import { createMuiFormModal } from "../Modal";

import { Participant } from "../../types";

interface Props {
  participant: Participant;
  onParticipantChange?: (p: Participant) => void;
}

interface State {
  nameWarningShown: boolean;
  expansionShown: boolean;
  modalShown: boolean;
  selectedStatisticId: string;
  currentName: string;
  dexterity: WrappedStatistic;
  movementRate: WrappedStatistic;
  speedModifier: WrappedStatistic;
  speedStatistics: WrappedStatistic[];
  hazardStatistics: WrappedStatistic[];
}

const SEQUENCE_START = 0;

export default class ParticipantContainer extends React.Component<
  Props & React.HTMLProps<HTMLElement>,
  State
> {
  static contextType = ChaseStartContext;

  static get DEFAULT_SPEED_STATISTICS() {
    return [
      {
        name: "CON",
        score: 15,
      },
      {
        name: "Drive Auto",
        score: 20,
      },
      {
        name: "Ride",
        score: 5,
      },
      {
        name: "Pilot (Aircraft)",
        score: 1,
      },
      {
        name: "Pilot (Boat)",
        score: 1,
      },
    ];
  }

  static get DEFAULT_HAZARD_STATISTICS() {
    return [
      {
        name: "STR",
        score: 15,
      },
      {
        name: "Climb",
        score: 20,
      },
      {
        name: "Swim",
        score: 20,
      },
      {
        name: "Dodge",
        score: 7,
      },
      {
        name: "Fighting (Brawl)",
        score: 25,
      },
      {
        name: "Firearms (Handgun)",
        score: 20,
      },
      {
        name: "Firearms (Rifle)",
        score: 25,
      },
    ];
  }

  private static initializeDexterity({
    dexterity,
  }: Participant): WrappedStatistic {
    return {
      statistic: {
        name: "DEX",
        score: dexterity,
      },
      currentValue: dexterity.toString(),
    };
  }

  private static initializeMovementRate({
    movementRate,
  }: Participant): WrappedStatistic {
    return {
      statistic: {
        name: "MOV",
        score: movementRate,
      },
      currentValue: movementRate.toString(),
      limiter: {
        lowerLimit: Number.MIN_SAFE_INTEGER,
        lowerWarning: 1,
        upperWarning: 10,
        upperLimit: Number.MAX_SAFE_INTEGER,
      },
    };
  }

  private static initializeDerivedSpeed({
    speedModifier,
  }: Participant): WrappedStatistic {
    return {
      statistic: {
        name: "SPD",
        score: speedModifier,
      },
      currentValue: speedModifier.toString(),
    };
  }

  private static generateSpeedModifier(score: number) {
    const degreeOfSuccess = roll(score);

    switch (degreeOfSuccess) {
      case Result.CriticalSuccess:
      case Result.ExtremeSuccess:
        return 1;
      case Result.HardSuccess:
      case Result.RegularSuccess:
        return 0;
      case Result.Failure:
      case Result.Fumble:
        return -1;
      default:
        throw new Error(
          `The degree of success, ${degreeOfSuccess}, was unexpected.`
        );
    }
  }

  private static parseValidScore(
    value: string,
    { limiter, statistic: { score: originalScore } }: WrappedStatistic
  ) {
    const upperLimit = limiter?.upperLimit || Number.MAX_SAFE_INTEGER;
    const lowerLimit = limiter?.lowerLimit || Number.MIN_SAFE_INTEGER;

    if (value !== "") {
      const score = Number.parseInt(value, 10);

      if (score > upperLimit) {
        return upperLimit;
      }

      if (score < lowerLimit) {
        return lowerLimit;
      }

      return score;
    }

    return originalScore;
  }

  static get EXPANSION_PREFIX() {
    return "participant-container-expansion";
  }

  private id;

  private speedStatSequence;

  private hazardStatSequence;

  constructor(props: Props) {
    super(props);

    this.id = nanoid();
    this.speedStatSequence = new UniqueSequenceGenerator(SEQUENCE_START);
    this.hazardStatSequence = new UniqueSequenceGenerator(SEQUENCE_START);

    this.handleToggleExpansionClick =
      this.handleToggleExpansionClick.bind(this);
    this.handleInitiateSpeedModifierGenerationClick =
      this.handleInitiateSpeedModifierGenerationClick.bind(this);
    this.handleCancelSpeedModifierGenerationClick =
      this.handleCancelSpeedModifierGenerationClick.bind(this);

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleNameBlur = this.handleNameBlur.bind(this);

    // Speed Statistic method binds
    this.handleCreateSpeedStatisticClick =
      this.handleCreateSpeedStatisticClick.bind(this);
    this.handleDeleteSpeedStatisticClick =
      this.handleDeleteSpeedStatisticClick.bind(this);
    this.handleRenameSpeedStatisticClick =
      this.handleRenameSpeedStatisticClick.bind(this);
    this.handleSpeedStatisticChange =
      this.handleSpeedStatisticChange.bind(this);
    this.handleSpeedStatisticBlur = this.handleSpeedStatisticBlur.bind(this);

    // Hazard Statistic method binds
    this.handleCreateHazardStatisticClick =
      this.handleCreateHazardStatisticClick.bind(this);
    this.handleDeleteHazardStatisticClick =
      this.handleDeleteHazardStatisticClick.bind(this);
    this.handleRenameHazardStatisticClick =
      this.handleRenameHazardStatisticClick.bind(this);
    this.handleHazardStatisticChange =
      this.handleHazardStatisticChange.bind(this);
    this.handleHazardStatisticBlur = this.handleHazardStatisticBlur.bind(this);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);

    const { participant } = this.props;

    this.state = {
      nameWarningShown: false,
      expansionShown: false,
      modalShown: false,
      selectedStatisticId: "",
      currentName: participant.name,
      dexterity: ParticipantContainer.initializeDexterity(participant),
      movementRate: ParticipantContainer.initializeMovementRate(participant),
      speedModifier: ParticipantContainer.initializeDerivedSpeed(participant),
      speedStatistics: this.initializeSpeedStatistics(participant),
      hazardStatistics: this.initializeHazardStatistics(participant),
    };
  }

  private handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { participant } = this.props;
    const { value } = event.currentTarget;

    if (value.trim()) {
      participant.name = value.trim();
      this.setState({ nameWarningShown: false });
    } else {
      this.setState({ nameWarningShown: true });
    }

    this.setState({ currentName: value });
  }

  private handleNameBlur() {
    const { participant, onParticipantChange } = this.props;

    if (onParticipantChange) onParticipantChange(participant);

    this.setState({ currentName: participant.name, nameWarningShown: false });
  }

  private handleDexterityChange(value: string) {
    this.setState(({ dexterity }) => {
      const dex = dexterity;

      dex.statistic.score = ParticipantContainer.parseValidScore(value, dex);
      dex.currentValue = value;

      return { dexterity: dex };
    });
  }

  private handleDexterityBlur() {
    this.setState(({ dexterity }, { participant, onParticipantChange }) => {
      const dex = dexterity;
      const p = participant;

      p.dexterity = dex.statistic.score;
      dex.currentValue = p.dexterity.toString();

      if (onParticipantChange) onParticipantChange(p);

      return { dexterity: dex };
    });
  }

  private handleDerivedSpeedChange(value: string) {
    this.setState(({ speedModifier }) => {
      const spdMod = speedModifier;

      spdMod.statistic.score = ParticipantContainer.parseValidScore(
        value,
        spdMod
      );
      spdMod.currentValue = value;

      return { speedModifier: spdMod };
    });
  }

  private handleDerivedSpeedBlur() {
    this.setState(({ speedModifier }, { participant, onParticipantChange }) => {
      const spdMod = speedModifier;
      const p = participant;

      p.speedModifier = spdMod.statistic.score;
      p.derivedSpeed = p.speedModifier + p.movementRate;
      spdMod.currentValue = p.speedModifier.toString();

      if (onParticipantChange) onParticipantChange(participant);

      return { speedModifier: spdMod };
    });
  }

  private handleMovementRateChange(value: string) {
    this.setState(({ movementRate }) => {
      const mov = movementRate;

      mov.statistic.score = ParticipantContainer.parseValidScore(value, mov);
      mov.currentValue = value;

      return { movementRate: mov };
    });
  }

  private handleMovementRateBlur() {
    this.setState(({ movementRate }, { participant, onParticipantChange }) => {
      const mov = movementRate;
      const p = participant;

      p.movementRate = mov.statistic.score;
      p.derivedSpeed = p.speedModifier + p.movementRate;
      mov.currentValue = p.movementRate.toString();

      if (onParticipantChange) onParticipantChange(participant);

      return { movementRate: mov };
    });
  }

  private handleSpeedStatisticChange(index: number, value: string) {
    this.setState(({ speedStatistics }) => {
      const spdStats = speedStatistics;
      const wrappedStatistic = spdStats[index];

      wrappedStatistic.statistic.score = ParticipantContainer.parseValidScore(
        value,
        wrappedStatistic
      );
      wrappedStatistic.currentValue = value;

      return { speedStatistics: spdStats };
    });
  }

  private handleSpeedStatisticBlur(index: number) {
    this.setState(
      ({ speedStatistics }, { participant, onParticipantChange }) => {
        const spdStats = speedStatistics;
        const p = participant;
        const wrappedStatistic = spdStats[index];

        p.speedStatistics = spdStats.map(({ statistic }) => statistic);
        wrappedStatistic.currentValue =
          p.speedStatistics[index].score.toString();

        if (onParticipantChange) onParticipantChange(participant);

        return { speedStatistics: spdStats };
      }
    );
  }

  private handleHazardStatisticChange(index: number, value: string) {
    this.setState(({ hazardStatistics }) => {
      const hzrdStats = hazardStatistics;
      const wrappedStatistic = hzrdStats[index];

      wrappedStatistic.statistic.score = ParticipantContainer.parseValidScore(
        value,
        wrappedStatistic
      );
      wrappedStatistic.currentValue = value;

      return { hazardStatistics: hzrdStats };
    });
  }

  private handleHazardStatisticBlur(index: number) {
    this.setState(
      ({ hazardStatistics }, { participant, onParticipantChange }) => {
        const hzrdStats = hazardStatistics;
        const p = participant;
        const wrappedStatistic = hzrdStats[index];

        p.hazardStatistics = hazardStatistics.map(({ statistic }) => statistic);
        wrappedStatistic.currentValue =
          p.hazardStatistics[index].score.toString();

        if (onParticipantChange) onParticipantChange(participant);

        return { hazardStatistics };
      }
    );
  }

  private handleSelectionChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ selectedStatisticId: event.currentTarget.value });
  }

  private handleSubmit() {
    const { selectedStatisticId, speedStatistics } = this.state;
    const score =
      speedStatistics.find(({ id }) => selectedStatisticId === id)?.statistic
        .score || 1;
    const modifier = ParticipantContainer.generateSpeedModifier(score);

    this.updateSpeedModifier(modifier);

    this.handleCancelSpeedModifierGenerationClick();
  }

  private handleToggleExpansionClick() {
    this.setState(({ expansionShown }) => ({
      expansionShown: !expansionShown,
    }));
  }

  private handleInitiateSpeedModifierGenerationClick(
    event: React.SyntheticEvent
  ) {
    event.stopPropagation();
    this.setState({ modalShown: true });
  }

  private handleCancelSpeedModifierGenerationClick() {
    this.setState({ modalShown: false });
  }

  private handleCreateSpeedStatisticClick() {
    const idNum = this.speedStatSequence.nextNum();
    const startingScore = 15;

    this.setState(({ speedStatistics }) => ({
      speedStatistics: [
        ...speedStatistics,
        {
          id: `speed-statistic-${nanoid()}`,
          statistic: {
            name: `New Stat #${idNum}`,
            score: startingScore,
          },
          currentValue: startingScore.toString(),
          key: idNum,
        },
      ],
    }));
  }

  private handleDeleteSpeedStatisticClick(index: number) {
    this.setState(({ speedStatistics }) => {
      const spdStats = speedStatistics;
      const [removedData] = spdStats.splice(index, 1);

      this.speedStatSequence.remove(removedData.key);

      return { speedStatistics: spdStats };
    });
  }

  private handleRenameSpeedStatisticClick(index: number, value: string) {
    this.setState(({ speedStatistics }) => {
      const spdStats = speedStatistics;
      const wrappedStatistic = spdStats[index];

      wrappedStatistic.statistic.name = value;
      spdStats[index] = wrappedStatistic;

      return { speedStatistics };
    });
  }

  private handleCreateHazardStatisticClick() {
    const idNum = this.hazardStatSequence.nextNum();
    const startingScore = 15;

    this.setState(({ hazardStatistics }) => ({
      hazardStatistics: [
        ...hazardStatistics,
        {
          id: `hazard-statistic-${nanoid()}`,
          statistic: {
            name: `New Stat #${idNum}`,
            score: startingScore,
          },
          currentValue: startingScore.toString(),
          key: idNum,
        },
      ],
    }));
  }

  private handleDeleteHazardStatisticClick(index: number) {
    this.setState(({ hazardStatistics }) => {
      const hzrdStats = hazardStatistics;
      const [removedData] = hzrdStats.splice(index, 1);

      this.hazardStatSequence.remove(removedData.key);

      return { hazardStatistics: hzrdStats };
    });
  }

  private handleRenameHazardStatisticClick(index: number, value: string) {
    this.setState(({ hazardStatistics }) => {
      const hzrdStats = hazardStatistics;
      const wrappedStatistic = hzrdStats[index];

      wrappedStatistic.statistic.name = value;
      hzrdStats[index] = wrappedStatistic;

      return { hazardStatistics: hzrdStats };
    });
  }

  private initializeSpeedStatistics({
    speedStatistics,
  }: Participant): WrappedStatistic[] {
    return speedStatistics.map((statistic) => ({
      id: `speed-statistic-${nanoid()}`,
      statistic,
      currentValue: statistic.score.toString(),
      key: this.speedStatSequence.nextNum(),
    }));
  }

  private initializeHazardStatistics({
    hazardStatistics,
  }: Participant): WrappedStatistic[] {
    return hazardStatistics.map((statistic) => ({
      id: `hazard-statistic-${nanoid()}`,
      statistic,
      currentValue: statistic.score.toString(),
      key: this.hazardStatSequence.nextNum(),
    }));
  }

  private updateSpeedModifier(modifier: number) {
    this.setState(({ speedModifier }) => {
      const spdMod = speedModifier;

      spdMod.statistic.score = modifier;
      spdMod.currentValue = modifier.toString();

      return { speedModifier: spdMod };
    });
  }

  private renderSpeedStatisticModal() {
    const { modalShown, speedStatistics, selectedStatisticId } = this.state;

    const Content = (
      <form onSubmit={this.handleSubmit}>
        <DialogContent>
          <FormControl component="fieldset">
            <FormLabel component="legend">Speed Statistic</FormLabel>
            <RadioGroup
              name="selectedStatistic"
              value={selectedStatisticId}
              onChange={this.handleSelectionChange}
            >
              {speedStatistics.map(({ id, statistic: { name } }) => (
                <FormControlLabel
                  key={id}
                  value={id}
                  control={<Radio color="secondary" />}
                  label={name}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            variant="outlined"
            onClick={this.handleCancelSpeedModifierGenerationClick}
          >
            CANCEL
          </Button>
          <Button color="secondary" type="submit">
            CONFIRM
          </Button>
        </DialogActions>
      </form>
    );

    /* 
      TODO (Coul Greer): Disable the "CONFIRM" button when no option is
      selected or when no speed statistics exist. Also, implement an error
      message when no speed statistics exist.
    */
    return (
      modalShown &&
      createMuiFormModal(
        modalShown,
        "Select speed statistic",
        Content,
        this.handleCancelSpeedModifierGenerationClick
      )
    );
  }

  private renderMainDisplay() {
    const { expansionShown } = this.state;

    return (
      <>
        <Box>{this.renderActionCount()}</Box>
        <Accordion
          expanded={expansionShown}
          onChange={this.handleToggleExpansionClick}
        >
          <AccordionSummary
            expandIcon={
              <span className="material-icons" aria-hidden>
                expand_more
              </span>
            }
            id={`participant-accordian-${this.id}`}
            aria-label="participant details"
            aria-controls={`${ParticipantContainer.EXPANSION_PREFIX}-${this.id}`}
          >
            {this.renderSummary()}
          </AccordionSummary>
          <AccordionDetails>{this.renderDetails()}</AccordionDetails>
        </Accordion>
      </>
    );
  }

  private renderActionCount() {
    const {
      participant: { isGrouped, actionCount },
    } = this.props;
    const hasChaseStarted = this.context;
    return (
      <Typography align="center">
        Actions : {isGrouped && hasChaseStarted ? actionCount : "N/A"}
      </Typography>
    );
  }

  private renderSummary() {
    const {
      nameWarningShown,
      currentName,
      dexterity,
      movementRate,
      speedModifier,
    } = this.state;

    return (
      <Grid container>
        <Grid item>
          <TextField
            id={`participant-name-${this.id}`}
            variant="filled"
            color="secondary"
            error={nameWarningShown}
            fullWidth
            label="Name"
            FormHelperTextProps={{ role: "alert" }}
            helperText={
              nameWarningShown
                ? "Provide the participant's name. Even Elder Ones have a title."
                : null
            }
            value={currentName}
            onClick={(event) => event.stopPropagation()}
            onChange={this.handleNameChange}
            onBlur={this.handleNameBlur}
          />
        </Grid>
        <Grid container item>
          <Grid item xs={4} zeroMinWidth>
            {DisplayFactory.createStatisticDisplay(
              dexterity,
              (value) => this.handleDexterityChange(value),
              () => this.handleDexterityBlur(),
              (event) => event.stopPropagation()
            )}
          </Grid>
          <Grid item xs={4} zeroMinWidth>
            {DisplayFactory.createStatisticDisplay(
              speedModifier,
              (value) => this.handleDerivedSpeedChange(value),
              () => this.handleDerivedSpeedBlur(),
              (event) => event.stopPropagation()
            )}
          </Grid>
          <Grid item xs={4} zeroMinWidth>
            {DisplayFactory.createStatisticDisplay(
              movementRate,
              (value) => this.handleMovementRateChange(value),
              () => this.handleMovementRateBlur(),
              (event) => event.stopPropagation()
            )}
          </Grid>
          <Grid item xs={12}>
            <Button
              color="secondary"
              fullWidth
              variant="outlined"
              onClick={this.handleInitiateSpeedModifierGenerationClick}
            >
              GENERATE
            </Button>
          </Grid>
        </Grid>
      </Grid>
    );
  }

  private renderDetails() {
    const { speedStatistics, hazardStatistics } = this.state;

    return (
      <Grid container>
        <Grid item>
          <StatisticTable
            title="SPEED Stats"
            data={speedStatistics}
            onCreateClick={this.handleCreateSpeedStatisticClick}
            onDeleteClick={this.handleDeleteSpeedStatisticClick}
            onRenameStatistic={this.handleRenameSpeedStatisticClick}
            onStatisticValueChange={this.handleSpeedStatisticChange}
            onStatisticValueBlur={this.handleSpeedStatisticBlur}
          />
        </Grid>
        <Grid item>
          <StatisticTable
            title="HAZARD Stats"
            data={hazardStatistics}
            onCreateClick={this.handleCreateHazardStatisticClick}
            onDeleteClick={this.handleDeleteHazardStatisticClick}
            onRenameStatistic={this.handleRenameHazardStatisticClick}
            onStatisticValueChange={this.handleHazardStatisticChange}
            onStatisticValueBlur={this.handleHazardStatisticBlur}
          />
        </Grid>
      </Grid>
    );
  }

  render() {
    const { role, "aria-label": ariaLabel } = this.props;

    return (
      <div role={role} aria-label={ariaLabel} className="ParticipantContainer">
        {this.renderMainDisplay()}
        {this.renderSpeedStatisticModal()}
      </div>
    );
  }
}
