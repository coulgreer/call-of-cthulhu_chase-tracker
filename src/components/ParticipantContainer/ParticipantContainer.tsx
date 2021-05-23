import React from "react";

import { Transition, animated } from "react-spring/renderprops";
import Modal from "react-modal";
import { nanoid } from "nanoid";

import Button from "../Button";
import StatisticTable from "../StatisticTable";
import { WrappedStatistic } from "../StatisticDisplay";
import DisplayFactory from "../StatisticDisplay/DisplayFactory";

import "./ParticipantContainer.css";

import UniqueSequenceGenerator from "../../utils/unique-sequence-generator";
import { roll, Result } from "../../utils/roller";

import { Participant } from "../../types";

interface Props {
  participant: Participant;
  onParticipantChange?: (p: Participant) => void;
}

interface State {
  nameWarningShown: boolean;
  expansionShown: boolean;
  modalShown: boolean;
  selectedStatisticScore: string;
  currentName: string;
  dexterity: WrappedStatistic;
  movementRate: WrappedStatistic;
  derivedSpeed: WrappedStatistic;
  speedStatistics: WrappedStatistic[];
  hazardStatistics: WrappedStatistic[];
}

const SEQUENCE_START = 0;

export default class ParticipantContainer extends React.Component<
  Props,
  State
> {
  static get WARNING_MESSAGE() {
    return "Even Elder Ones have a title. You ought follow suit.";
  }

  static get DEFAULT_STAT_NAME() {
    return "New Stat";
  }

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
    derivedSpeed,
  }: Participant): WrappedStatistic {
    return {
      statistic: {
        name: "Speed",
        score: derivedSpeed,
      },
      currentValue: derivedSpeed.toString(),
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

  private speedStatSequence: UniqueSequenceGenerator;

  private hazardStatSequence: UniqueSequenceGenerator;

  constructor(props: Props) {
    super(props);

    this.id = nanoid();
    this.speedStatSequence = new UniqueSequenceGenerator(SEQUENCE_START);
    this.hazardStatSequence = new UniqueSequenceGenerator(SEQUENCE_START);

    this.toggleExpansion = this.toggleExpansion.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleNameBlur = this.handleNameBlur.bind(this);

    // Speed Statistic method binds
    this.createSpeedStatistic = this.createSpeedStatistic.bind(this);
    this.deleteSpeedStatistic = this.deleteSpeedStatistic.bind(this);
    this.renameSpeedStatistic = this.renameSpeedStatistic.bind(this);
    this.handleSpeedStatisticChange = this.handleSpeedStatisticChange.bind(
      this
    );
    this.handleSpeedStatisticBlur = this.handleSpeedStatisticBlur.bind(this);

    // Hazard Statistic method binds
    this.createHazardStatistic = this.createHazardStatistic.bind(this);
    this.deleteHazardStatistic = this.deleteHazardStatistic.bind(this);
    this.renameHazardStatistic = this.renameHazardStatistic.bind(this);
    this.handleHazardStatisticChange = this.handleHazardStatisticChange.bind(
      this
    );
    this.handleHazardStatisticBlur = this.handleHazardStatisticBlur.bind(this);

    this.calculateSpeedModifier = this.calculateSpeedModifier.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);

    const { participant } = this.props;

    this.state = {
      nameWarningShown: false,
      expansionShown: false,
      modalShown: false,
      selectedStatisticScore: "",
      currentName: participant.name,
      dexterity: ParticipantContainer.initializeDexterity(participant),
      movementRate: ParticipantContainer.initializeMovementRate(participant),
      derivedSpeed: ParticipantContainer.initializeDerivedSpeed(participant),
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
    this.setState((state) => {
      const { dexterity } = state;
      const { statistic } = dexterity;

      statistic.score = ParticipantContainer.parseValidScore(value, dexterity);

      dexterity.currentValue = value;

      return { dexterity };
    });
  }

  private handleDerivedSpeedChange(value: string) {
    this.setState((state) => {
      const { derivedSpeed } = state;
      const { statistic } = derivedSpeed;

      statistic.score = ParticipantContainer.parseValidScore(
        value,
        derivedSpeed
      );

      derivedSpeed.currentValue = value;

      return { derivedSpeed };
    });
  }

  private handleMovementRateChange(value: string) {
    this.setState((state) => {
      const { movementRate } = state;
      const { statistic } = movementRate;

      statistic.score = ParticipantContainer.parseValidScore(
        value,
        movementRate
      );

      movementRate.currentValue = value;

      return { movementRate };
    });
  }

  private handleSpeedStatisticChange(index: number, value: string) {
    this.setState((state) => {
      const { speedStatistics } = state;
      const wrappedStatistic = speedStatistics[index];
      const { statistic } = wrappedStatistic;

      statistic.score = ParticipantContainer.parseValidScore(
        value,
        wrappedStatistic
      );

      wrappedStatistic.currentValue = value;

      speedStatistics[index] = wrappedStatistic;
      return { speedStatistics };
    });
  }

  private handleHazardStatisticChange(index: number, value: string) {
    this.setState((state) => {
      const { hazardStatistics } = state;
      const wrappedStatistic = hazardStatistics[index];
      const { statistic } = wrappedStatistic;

      statistic.score = ParticipantContainer.parseValidScore(
        value,
        wrappedStatistic
      );

      wrappedStatistic.currentValue = value;

      hazardStatistics[index] = wrappedStatistic;
      return { hazardStatistics };
    });
  }

  private handleDexterityBlur() {
    this.setState((state, props) => {
      const { participant, onParticipantChange } = props;
      const { dexterity } = state;

      const {
        statistic: { score },
      } = dexterity;

      participant.dexterity = score;
      if (onParticipantChange) onParticipantChange(participant);

      dexterity.currentValue = score.toString();

      return { dexterity };
    });
  }

  private handleDerivedSpeedBlur() {
    this.setState((state, props) => {
      const { participant, onParticipantChange } = props;
      const { derivedSpeed } = state;

      const {
        statistic: { score },
      } = derivedSpeed;

      participant.derivedSpeed = score;
      if (onParticipantChange) onParticipantChange(participant);

      derivedSpeed.currentValue = score.toString();

      return { derivedSpeed };
    });
  }

  private handleMovementRateBlur() {
    this.setState((state, props) => {
      const { participant, onParticipantChange } = props;
      const { movementRate } = state;

      const {
        statistic: { score },
      } = movementRate;

      participant.movementRate = score;
      if (onParticipantChange) onParticipantChange(participant);

      movementRate.currentValue = score.toString();

      return { movementRate };
    });
  }

  private handleSpeedStatisticBlur(index: number) {
    this.setState((state, props) => {
      const { participant, onParticipantChange } = props;
      const { speedStatistics } = state;
      const wrappedStatistic = speedStatistics[index];
      const { score } = wrappedStatistic.statistic;

      speedStatistics[index] = wrappedStatistic;
      participant.speedStatistics = speedStatistics.map(
        (statistic) => statistic.statistic
      );
      if (onParticipantChange) onParticipantChange(participant);

      wrappedStatistic.currentValue = score.toString();

      return { speedStatistics };
    });
  }

  private handleHazardStatisticBlur(index: number) {
    this.setState((state, props) => {
      const { participant, onParticipantChange } = props;
      const { hazardStatistics } = state;
      const wrappedStatistic = hazardStatistics[index];
      const { score } = wrappedStatistic.statistic;

      hazardStatistics[index] = wrappedStatistic;
      participant.hazardStatistics = hazardStatistics.map(
        (statistic) => statistic.statistic
      );
      if (onParticipantChange) onParticipantChange(participant);

      wrappedStatistic.currentValue = score.toString();

      return { hazardStatistics };
    });
  }

  private handleSelectionChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.currentTarget;

    this.setState({ selectedStatisticScore: value });
  }

  private initializeSpeedStatistics({
    speedStatistics,
  }: Participant): WrappedStatistic[] {
    return speedStatistics.map((statistic) => ({
      statistic,
      currentValue: statistic.score.toString(),
      key: this.speedStatSequence.nextNum(),
    }));
  }

  private initializeHazardStatistics({
    hazardStatistics,
  }: Participant): WrappedStatistic[] {
    return hazardStatistics.map((statistic) => ({
      statistic,
      currentValue: statistic.score.toString(),
      key: this.hazardStatSequence.nextNum(),
    }));
  }

  private calculateSpeedModifier() {
    const { selectedStatisticScore } = this.state;

    const modifier = ParticipantContainer.generateSpeedModifier(
      Number.parseInt(selectedStatisticScore, 10)
    );
    this.updateSpeedModifier(modifier);
    this.closeModal();
  }

  private toggleExpansion() {
    this.setState((state) => ({
      expansionShown: !state.expansionShown,
    }));
  }

  private createSpeedStatistic() {
    const key = this.speedStatSequence.nextNum();
    const startingScore = 15;
    const newData: WrappedStatistic = {
      statistic: {
        name: `${ParticipantContainer.DEFAULT_STAT_NAME} #${key}`,
        score: startingScore,
      },
      currentValue: startingScore.toString(),
      key,
    };

    this.setState((state) => ({
      speedStatistics: [...state.speedStatistics, newData],
    }));
  }

  private deleteSpeedStatistic(index: number) {
    this.setState((state) => {
      const { speedStatistics } = state;
      const [removedData] = speedStatistics.splice(index, 1);

      this.speedStatSequence.remove(removedData.key);

      return { speedStatistics };
    });
  }

  private renameSpeedStatistic(index: number, value: string) {
    this.setState((state) => {
      const { speedStatistics } = state;
      const wrappedStatistic = speedStatistics[index];

      wrappedStatistic.statistic.name = value;
      speedStatistics[index] = wrappedStatistic;

      return { speedStatistics };
    });
  }

  private createHazardStatistic() {
    const key = this.hazardStatSequence.nextNum();
    const startingScore = 15;
    const newData = {
      statistic: {
        name: `${ParticipantContainer.DEFAULT_STAT_NAME} #${key}`,
        score: startingScore,
      },
      currentValue: startingScore.toString(),
      key,
    };

    this.setState((state) => ({
      hazardStatistics: [...state.hazardStatistics, newData],
    }));
  }

  private deleteHazardStatistic(index: number) {
    this.setState((state) => {
      const { hazardStatistics } = state;
      const [removedData] = hazardStatistics.splice(index, 1);

      this.hazardStatSequence.remove(removedData.key);

      return { hazardStatistics };
    });
  }

  private renameHazardStatistic(index: number, value: string) {
    this.setState((state) => {
      const { hazardStatistics } = state;
      const wrappedStatistic = hazardStatistics[index];

      wrappedStatistic.statistic.name = value;
      hazardStatistics[index] = wrappedStatistic;

      return { hazardStatistics };
    });
  }

  private openModal() {
    this.setState({ modalShown: true });
  }

  private closeModal() {
    this.setState({ modalShown: false });
  }

  private updateSpeedModifier(modifier: number) {
    this.setState((state) => {
      const { derivedSpeed } = state;

      derivedSpeed.statistic.score = modifier;
      derivedSpeed.currentValue = modifier.toString();

      return { derivedSpeed };
    });
  }

  /*
     FIXME (Coul Greer): There is a known bug in ReactModal involving radio
     buttons and pressing shift+tab. The focus escapes the modal when
     shift-tabbing through modal elements causing a break in the very point of
     using this package.
   */
  private renderSpeedStatisticModal() {
    const { modalShown, speedStatistics } = this.state;

    /* 
      TODO (Coul Greer): Disable the "CONFIRM" button when no option is
      selected or when no speed statistics exist. Also, implement an error
      message when no speed statistics exist.
    */
    return (
      <Modal
        className="Modal__Content"
        overlayClassName="Modal__Overlay"
        contentLabel="Select Speed Statistic"
        isOpen={modalShown}
        onRequestClose={this.closeModal}
      >
        <h2>Select a Speed Statistic</h2>
        <hr />
        <form onSubmit={this.calculateSpeedModifier}>
          {speedStatistics.map((wrappedStatistic) => (
            <label className="radio-button" key={wrappedStatistic.key}>
              <input
                className="radio-button__input"
                type="radio"
                name="selectedStatistic"
                value={wrappedStatistic.statistic.score}
                onChange={this.handleSelectionChange}
              />
              <span className="radio-button__checkmark" />
              <span className="input__label">
                {wrappedStatistic.statistic.name}
              </span>
            </label>
          ))}
          <hr />
          <div className="Modal__Content__options">
            <Button
              className="button button--secondary button--small"
              onClick={this.closeModal}
            >
              CANCEL
            </Button>
            <Button
              className="button button--primary button--small"
              type="submit"
            >
              CONFIRM
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  private renderMainDisplay() {
    const {
      expansionShown,
      nameWarningShown,
      currentName,
      dexterity,
      movementRate,
      derivedSpeed,
    } = this.state;

    return (
      <div className="ParticipantContainer__main-display">
        <label>
          <span className="input__label">Name</span>
          <input
            className="textbox textbox--full-width"
            type="text"
            value={currentName}
            onChange={this.handleNameChange}
            onBlur={this.handleNameBlur}
          />
        </label>
        <p
          className="error  text--small"
          style={{
            visibility: nameWarningShown ? "visible" : "hidden",
          }}
        >
          {ParticipantContainer.WARNING_MESSAGE}
        </p>
        <div className="ParticipantContainer__footer">
          <div className="ParticipantContainer__main-characteristics">
            {DisplayFactory.createStatisticDisplay(
              "StatisticDisplay--vertical",
              dexterity,
              (value) => this.handleDexterityChange(value),
              () => this.handleDexterityBlur()
            )}
            {DisplayFactory.createStatisticDisplay(
              "StatisticDisplay--vertical",
              derivedSpeed,
              (value) => this.handleDerivedSpeedChange(value),
              () => this.handleDerivedSpeedBlur()
            )}
            {DisplayFactory.createStatisticDisplay(
              "StatisticDisplay--vertical",
              movementRate,
              (value) => this.handleMovementRateChange(value),
              () => this.handleMovementRateBlur()
            )}
            <Button
              className="button button--secondary button--small"
              onClick={this.openModal}
            >
              GENERATE
            </Button>
          </div>
          <Button
            className="button button--primary button--small button--circular"
            aria-label="Participant Details"
            aria-expanded={expansionShown}
            aria-controls={`${ParticipantContainer.EXPANSION_PREFIX}-${this.id}`}
            onClick={this.toggleExpansion}
          >
            {expansionShown ? (
              <span className="material-icons" aria-hidden>
                expand_less
              </span>
            ) : (
              <span className="material-icons" aria-hidden>
                expand_more
              </span>
            )}
          </Button>
        </div>
      </div>
    );
  }

  private renderExpansiveDisplay() {
    const { expansionShown } = this.state;
    return (
      <Transition
        native
        items={expansionShown}
        from={{ height: 0, overflow: "hidden" }}
        enter={{ height: "auto" }}
        leave={{ height: 0 }}
      >
        {(shown) =>
          shown &&
          ((props) => (
            <animated.div
              id={`${ParticipantContainer.EXPANSION_PREFIX}-${this.id}`}
              className="ParticipantContainer__extended-display"
              style={props}
            >
              {this.renderSpeedStatistics()}
              {this.renderHazardStatistics()}
            </animated.div>
          ))
        }
      </Transition>
    );
  }

  private renderSpeedStatistics() {
    const { speedStatistics } = this.state;
    const title = "SPEED Stats";

    return (
      <StatisticTable
        title={title}
        data={speedStatistics}
        onCreateClick={this.createSpeedStatistic}
        onDeleteClick={this.deleteSpeedStatistic}
        onRenameStatistic={this.renameSpeedStatistic}
        onStatisticValueChange={this.handleSpeedStatisticChange}
        onStatisticValueBlur={this.handleSpeedStatisticBlur}
      />
    );
  }

  private renderHazardStatistics() {
    const { hazardStatistics } = this.state;
    const title = "HAZARD Stats";

    return (
      <StatisticTable
        title={title}
        data={hazardStatistics}
        onCreateClick={this.createHazardStatistic}
        onDeleteClick={this.deleteHazardStatistic}
        onRenameStatistic={this.renameHazardStatistic}
        onStatisticValueChange={this.handleHazardStatisticChange}
        onStatisticValueBlur={this.handleHazardStatisticBlur}
      />
    );
  }

  render() {
    return (
      <div className="ParticipantContainer">
        {this.renderMainDisplay()}
        {this.renderExpansiveDisplay()}
        {this.renderSpeedStatisticModal()}
      </div>
    );
  }
}