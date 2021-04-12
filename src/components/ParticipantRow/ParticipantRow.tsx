import React from "react";
import { Transition, animated } from "react-spring/renderprops";
import Modal from "react-modal";

import Button from "../Button";
import StatisticTable from "../StatisticTable";
import { WrappedStatistic } from "../StatisticDisplay";
import DisplayFactory from "../StatisticDisplay/DisplayFactory";

import ExpandLessIcon from "../../images/baseline_expand_less_black_24dp.png";
import ExpandMoreIcon from "../../images/baseline_expand_more_black_24dp.png";

import "./ParticipantRow.css";

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
  selectedStatValue: string;
  currentName: string;
  mainStatistics: WrappedStatistic[];
  speedStatistics: WrappedStatistic[];
  hazardStatistics: WrappedStatistic[];
}

const SEQUENCE_START = 0;

export default class ParticipantRow extends React.Component<Props, State> {
  static get MAIN_STATISTICS_NAMES() {
    return ["DEX", "Speed", "MOV"];
  }

  static get DEXTERITY_INDEX() {
    return 0;
  }

  static get SPEED_INDEX() {
    return 1;
  }

  static get MOVEMENT_RATING_INDEX() {
    return 2;
  }

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

  private static initializeMainStatistics({
    dexterity,
    derivedSpeed,
    movementRate,
  }: Participant): WrappedStatistic[] {
    return [
      {
        statistic: {
          name:
            ParticipantRow.MAIN_STATISTICS_NAMES[
              ParticipantRow.DEXTERITY_INDEX
            ],
          score: dexterity,
        },
        currentValue: dexterity.toString(),
        key: ParticipantRow.DEXTERITY_INDEX,
      },
      {
        statistic: {
          name:
            ParticipantRow.MAIN_STATISTICS_NAMES[ParticipantRow.SPEED_INDEX],
          score: derivedSpeed,
        },
        currentValue: derivedSpeed.toString(),
        key: ParticipantRow.SPEED_INDEX,
      },
      {
        statistic: {
          name:
            ParticipantRow.MAIN_STATISTICS_NAMES[
              ParticipantRow.MOVEMENT_RATING_INDEX
            ],
          score: movementRate,
        },
        currentValue: movementRate.toString(),
        limiter: {
          lowerLimit: Number.MIN_SAFE_INTEGER,
          lowerWarning: 1,
          upperWarning: 10,
          upperLimit: Number.MAX_SAFE_INTEGER,
        },
        key: ParticipantRow.MOVEMENT_RATING_INDEX,
      },
    ];
  }

  static generateSpeedModifier(value: number) {
    const degreeOfSuccess = roll(value);

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

  /* eslint-disable no-param-reassign */
  static updateValue(value: string, data: WrappedStatistic) {
    const { limiter, statistic } = data;

    const upperLimit = limiter?.upperLimit || Number.MAX_SAFE_INTEGER;
    const lowerLimit = limiter?.lowerLimit || Number.MIN_SAFE_INTEGER;

    if (value !== "") {
      const valueNum = Number.parseInt(value, 10);
      if (valueNum > upperLimit) {
        statistic.score = upperLimit;
      } else if (valueNum < lowerLimit) {
        statistic.score = lowerLimit;
      } else {
        statistic.score = valueNum;
      }
    }

    data.currentValue = value;
  }

  private speedStatSequence: UniqueSequenceGenerator;

  private hazardStatSequence: UniqueSequenceGenerator;

  constructor(props: Props) {
    super(props);

    this.speedStatSequence = new UniqueSequenceGenerator(SEQUENCE_START);
    this.hazardStatSequence = new UniqueSequenceGenerator(SEQUENCE_START);

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleNameBlur = this.handleNameBlur.bind(this);

    this.toggleExpansion = this.toggleExpansion.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

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
      selectedStatValue: "",
      currentName: participant.name,
      mainStatistics: ParticipantRow.initializeMainStatistics(participant),
      speedStatistics: this.initializeSpeedStatistics(participant),
      hazardStatistics: this.initializeHazardStatistics(participant),
    };
  }

  private handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { onParticipantChange } = this.props;
    const { value } = event.currentTarget;

    if (value.trim()) {
      const { participant } = this.props;
      participant.name = value;
      if (onParticipantChange) onParticipantChange(participant);
      this.setState({ nameWarningShown: false });
    } else {
      this.setState({ nameWarningShown: true });
    }

    this.setState({ currentName: value });
  }

  private handleNameBlur() {
    const { participant } = this.props;

    this.setState({ currentName: participant.name, nameWarningShown: false });
  }

  private handleMainStatisticChange(index: number, value: string) {
    this.setState((state) => {
      const { mainStatistics } = state;
      const wrappedStatistic = mainStatistics[index];

      ParticipantRow.updateValue(value, wrappedStatistic);
      mainStatistics[index] = wrappedStatistic;

      return { mainStatistics };
    });
  }

  private handleSpeedStatisticChange(index: number, value: string) {
    this.setState((state) => {
      const { speedStatistics } = state;
      const wrappedStatistic = speedStatistics[index];

      ParticipantRow.updateValue(value, wrappedStatistic);
      speedStatistics[index] = wrappedStatistic;

      return { speedStatistics };
    });
  }

  private handleHazardStatisticChange(index: number, value: string) {
    this.setState((state) => {
      const { hazardStatistics } = state;
      const wrappedStatistic = hazardStatistics[index];

      ParticipantRow.updateValue(value, wrappedStatistic);
      hazardStatistics[index] = wrappedStatistic;

      return { hazardStatistics };
    });
  }

  private handleMainStatisticBlur(index: number) {
    this.setState((state) => {
      const { mainStatistics } = state;
      const wrappedStatistic = mainStatistics[index];
      const { score } = wrappedStatistic.statistic;

      wrappedStatistic.currentValue = score.toString();
      mainStatistics[index] = wrappedStatistic;

      return { mainStatistics };
    });
  }

  private handleSpeedStatisticBlur(index: number) {
    this.setState((state) => {
      const { speedStatistics } = state;
      const wrappedStatistic = speedStatistics[index];
      const { score } = wrappedStatistic.statistic;

      wrappedStatistic.currentValue = score.toString();
      speedStatistics[index] = wrappedStatistic;

      return { speedStatistics };
    });
  }

  private handleHazardStatisticBlur(index: number) {
    const { hazardStatistics } = this.state;
    const wrappedStatistic = hazardStatistics[index];
    const { score } = wrappedStatistic.statistic;

    wrappedStatistic.currentValue = score.toString();

    hazardStatistics[index] = wrappedStatistic;
    this.setState({ hazardStatistics });
  }

  private handleSelectionChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;

    this.setState({ selectedStatValue: value });
  }

  private initializeSpeedStatistics({
    speedSkills,
  }: Participant): WrappedStatistic[] {
    return speedSkills.map((skill) => ({
      statistic: skill,
      currentValue: skill.score.toString(),
      key: this.speedStatSequence.nextNum(),
    }));
  }

  private initializeHazardStatistics({
    hazardSkills,
  }: Participant): WrappedStatistic[] {
    return hazardSkills.map((skill) => ({
      statistic: skill,
      currentValue: skill.score.toString(),
      key: this.hazardStatSequence.nextNum(),
    }));
  }

  private calculateSpeedModifier() {
    const { selectedStatValue } = this.state;

    const modifier = ParticipantRow.generateSpeedModifier(
      Number.parseInt(selectedStatValue, 10)
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
        name: `${ParticipantRow.DEFAULT_STAT_NAME} #${key}`,
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
        name: `${ParticipantRow.DEFAULT_STAT_NAME} #${key}`,
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
      const { mainStatistics } = state;
      const wrappedStatistic = mainStatistics[ParticipantRow.SPEED_INDEX];

      wrappedStatistic.statistic.score = modifier;
      wrappedStatistic.currentValue = modifier.toString();

      mainStatistics[ParticipantRow.SPEED_INDEX] = wrappedStatistic;
      return { mainStatistics };
    });
  }

  /*
   * FIXME (Coul Greer): There is a known bug in ReactModal involving radio
   * buttons and pressing shift+tab. The focus escapes the modal when
   * shift-tabbing through modal elements causing a break in the very point of
   * using this package.
   */
  private renderSpeedStatisticModal() {
    const { modalShown, speedStatistics } = this.state;

    return (
      <Modal
        className="Modal__Content"
        overlayClassName="Modal__Overlay"
        contentLabel="Select Speed Statistic"
        isOpen={modalShown}
        onRequestClose={this.closeModal}
      >
        <p>Select a speed skill</p>
        <form onSubmit={this.calculateSpeedModifier}>
          {speedStatistics.map((wrappedStatistic) => (
            <label
              className="input__radio input__label"
              key={wrappedStatistic.key}
            >
              <input
                className="input__radio__checkbox"
                type="radio"
                name="selectedStatistic"
                value={wrappedStatistic.statistic.score}
                onChange={this.handleSelectionChange}
              />
              <span className="input__radio__checkmark" />
              {wrappedStatistic.statistic.name}
            </label>
          ))}
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
      mainStatistics,
    } = this.state;

    return (
      <div className="ParticipantRow__main-display">
        <label className="input input__label">
          Name
          <input
            className="input__textbox input__textbox--full-width"
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
          {ParticipantRow.WARNING_MESSAGE}
        </p>
        <div className="ParticipantRow__footer">
          <div className="ParticipantRow__main-characteristics">
            {mainStatistics.map((data, index) =>
              DisplayFactory.createStatisticDisplay(
                "StatisticDisplay--vertical",
                data,
                (value) => this.handleMainStatisticChange(index, value),
                () => this.handleMainStatisticBlur(index)
              )
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
            onClick={this.toggleExpansion}
          >
            {expansionShown ? (
              <img src={ExpandLessIcon} alt="Collapse" />
            ) : (
              <img src={ExpandMoreIcon} alt="Expand" />
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
              className="ParticipantRow__extended-display"
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
      <div className="ParticipantRow">
        {this.renderMainDisplay()}
        {this.renderExpansiveDisplay()}
        {this.renderSpeedStatisticModal()}
      </div>
    );
  }
}
