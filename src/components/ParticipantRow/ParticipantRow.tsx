import React from "react";
import { Transition, animated } from "react-spring/renderprops";
import Modal from "react-modal";

import Button from "../Button";
import { Data as StatisticDisplayData } from "../StatisticDisplay";
import DisplayFactory from "../StatisticDisplay/DisplayFactory";

import Add from "../../images/baseline_add_black_36dp_x1.png";
import ExpandLess from "../../images/baseline_expand_less_black_24dp.png";
import ExpandMore from "../../images/baseline_expand_more_black_24dp.png";

import "./ParticipantRow.css";
import UniqueSequenceGenerator from "../../utils/unique-sequence-generator";
import { roll, Result } from "../../utils/roller";

function determineDegreeOfSuccess(value: number) {
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

interface Props {
  defaultParticipantName: string;
}

interface State {
  currentName: string;
  lastValidName: string;
  nameWarningShown: boolean;
  expansionShown: boolean;
  mainStats: StatisticDisplayData[];
  speedStats: StatisticDisplayData[];
  hazardStats: StatisticDisplayData[];
  selectedStatValue: string;
  modalShown: boolean;
}

export default class ParticipantRow extends React.Component<Props, State> {
  static get DEX_TITLE() {
    return "DEX";
  }

  static get SPEED_TITLE() {
    return "Speed";
  }

  static get MOV_TITLE() {
    return "MOV";
  }

  static get CON_TITLE() {
    return "CON";
  }

  static get DRIVE_TITLE() {
    return "Drive Auto";
  }

  static get RIDE_TITLE() {
    return "Ride";
  }

  static get AIR_TITLE() {
    return "Pilot (Aircraft)";
  }

  static get SEA_TITLE() {
    return "Pilot (Boat)";
  }

  static get STR_TITLE() {
    return "STR";
  }

  static get CLIMB_TITLE() {
    return "Climb";
  }

  static get SWIM_TITLE() {
    return "Swim";
  }

  static get DODGE_TITLE() {
    return "Dodge";
  }

  static get BRAWL_TITLE() {
    return "Fighting (Brawl)";
  }

  static get HANDGUN_TITLE() {
    return "Firearms (Handgun)";
  }

  static get RIFLE_TITLE() {
    return "Firearms (Rifle)";
  }

  static get WARNING_MESSAGE() {
    return "Even Elder Ones have a title. You ought follow suit.";
  }

  static get DEFAULT_STAT_NAME() {
    return "New Stat";
  }

  /* eslint-disable no-param-reassign */
  static manageValue(value: string, data: StatisticDisplayData) {
    const {
      upperLimit = Number.MAX_SAFE_INTEGER,
      lowerLimit = Number.MIN_SAFE_INTEGER,
    } = data;

    if (value !== "") {
      const valueNum = Number.parseInt(value, 10);
      if (valueNum > upperLimit) {
        data.validValue = upperLimit;
      } else if (valueNum < lowerLimit) {
        data.validValue = lowerLimit;
      } else {
        data.validValue = valueNum;
      }
    }
    data.currentValue = value;
  }

  private speedStatSequence: UniqueSequenceGenerator;

  private hazardStatSequence: UniqueSequenceGenerator;

  private speedEl: StatisticDisplayData;

  constructor(props: Props) {
    super(props);

    this.speedStatSequence = new UniqueSequenceGenerator(0);
    this.hazardStatSequence = new UniqueSequenceGenerator(0);
    this.speedEl = { title: "", currentValue: "0", validValue: 0 };

    this.handleNameChanged = this.handleNameChanged.bind(this);
    this.handleNameDeselected = this.handleNameDeselected.bind(this);
    this.handleViewToggling = this.handleViewToggling.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.handleSpeedStatCreating = this.handleSpeedStatCreating.bind(this);
    this.handleHazardStatCreating = this.handleHazardStatCreating.bind(this);
    this.calculateModifier = this.calculateModifier.bind(this);

    const { defaultParticipantName } = this.props;

    this.state = {
      currentName: defaultParticipantName,
      lastValidName: defaultParticipantName,
      nameWarningShown: false,
      expansionShown: false,
      mainStats: this.initializeMainStats(),
      speedStats: this.initializeSpeedStats(),
      hazardStats: this.initializeHazardStats(),
      selectedStatValue: "",
      modalShown: false,
    };
  }

  private handleMainStatisticChange(index: number, value: string) {
    const { mainStats } = this.state;
    const data = mainStats[index];

    ParticipantRow.manageValue(value, data);

    mainStats[index] = data;
    this.setState({ mainStats });
  }

  private handleSpeedStatisticChange(index: number, value: string) {
    const { speedStats } = this.state;
    const data = speedStats[index];

    ParticipantRow.manageValue(value, data);

    speedStats[index] = data;
    this.setState({ speedStats });
  }

  private handleHazardStatisticChange(index: number, value: string) {
    const { hazardStats } = this.state;
    const data = hazardStats[index];

    ParticipantRow.manageValue(value, data);

    hazardStats[index] = data;
    this.setState({ hazardStats });
  }

  private handleMainStatisticBlur(index: number) {
    const { mainStats } = this.state;
    const data = mainStats[index];
    const { validValue } = data;

    data.currentValue = validValue.toString();
    mainStats[index] = data;

    this.setState({ mainStats });
  }

  private handleSpeedStatisticBlur(index: number) {
    const { speedStats } = this.state;
    const data = speedStats[index];
    const { validValue } = data;

    data.currentValue = validValue.toString();
    speedStats[index] = data;

    this.setState({ speedStats });
  }

  private handleHazardStatisticBlur(index: number) {
    const { hazardStats } = this.state;
    const data = hazardStats[index];
    const { validValue } = data;

    data.currentValue = validValue.toString();
    hazardStats[index] = data;

    this.setState({ hazardStats });
  }

  initializeMainStats() {
    const stats = [
      { title: ParticipantRow.DEX_TITLE, currentValue: "15", validValue: 15 },
      { title: ParticipantRow.SPEED_TITLE, currentValue: "0", validValue: 0 },
      {
        title: ParticipantRow.MOV_TITLE,
        currentValue: "2",
        validValue: 2,
        lowerWarning: 1,
        upperWarning: 10,
      },
    ];

    [this.speedEl] = stats.filter(
      (stat) => stat.title === ParticipantRow.SPEED_TITLE
    );

    return stats;
  }

  private initializeSpeedStats() {
    return [
      {
        title: ParticipantRow.CON_TITLE,
        currentValue: "15",
        validValue: 15,
        key: this.speedStatSequence.nextNum(),
      },
      {
        title: ParticipantRow.DRIVE_TITLE,
        currentValue: "20",
        validValue: 20,
        key: this.speedStatSequence.nextNum(),
      },
      {
        title: ParticipantRow.RIDE_TITLE,
        currentValue: "5",
        validValue: 5,
        key: this.speedStatSequence.nextNum(),
      },
      {
        title: ParticipantRow.AIR_TITLE,
        currentValue: "1",
        validValue: 1,
        key: this.speedStatSequence.nextNum(),
      },
      {
        title: ParticipantRow.SEA_TITLE,
        currentValue: "1",
        validValue: 1,
        key: this.speedStatSequence.nextNum(),
      },
    ];
  }

  private initializeHazardStats() {
    return [
      {
        title: ParticipantRow.STR_TITLE,
        currentValue: "15",
        validValue: 15,
        key: this.hazardStatSequence.nextNum(),
      },
      {
        title: ParticipantRow.CLIMB_TITLE,
        currentValue: "20",
        validValue: 20,
        key: this.hazardStatSequence.nextNum(),
      },
      {
        title: ParticipantRow.SWIM_TITLE,
        currentValue: "20",
        validValue: 20,
        key: this.hazardStatSequence.nextNum(),
      },
      {
        title: ParticipantRow.DODGE_TITLE,
        currentValue: "7",
        validValue: 7,
        key: this.hazardStatSequence.nextNum(),
      },
      {
        title: ParticipantRow.BRAWL_TITLE,
        currentValue: "25",
        validValue: 25,
        key: this.hazardStatSequence.nextNum(),
      },
      {
        title: ParticipantRow.HANDGUN_TITLE,
        currentValue: "20",
        validValue: 20,
        key: this.hazardStatSequence.nextNum(),
      },
      {
        title: ParticipantRow.RIFLE_TITLE,
        currentValue: "25",
        validValue: 25,
        key: this.hazardStatSequence.nextNum(),
      },
    ];
  }

  private handleNameChanged(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.currentTarget;

    if (value.trim()) {
      this.setState(() => ({
        lastValidName: value,
        nameWarningShown: false,
      }));
    } else {
      this.setState(() => ({ nameWarningShown: true }));
    }

    this.setState(() => ({ currentName: value }));
  }

  private handleNameDeselected() {
    this.setState((state) => ({
      currentName: state.lastValidName,
      nameWarningShown: false,
    }));
  }

  private handleViewToggling() {
    this.setState((state) => ({
      expansionShown: !state.expansionShown,
    }));
  }

  private handleSpeedStatCreating() {
    const key = this.speedStatSequence.nextNum();
    const newData = {
      title: `${ParticipantRow.DEFAULT_STAT_NAME} #${key}`,
      currentValue: "15",
      validValue: 15,
      key,
    };

    this.setState((state) => ({
      speedStats: [...state.speedStats, newData],
    }));
  }

  private handleHazardStatCreating() {
    const key = this.hazardStatSequence.nextNum();
    const newData = {
      title: `${ParticipantRow.DEFAULT_STAT_NAME} #${key}`,
      currentValue: "15",
      validValue: 15,
      key,
    };

    this.setState((state) => ({
      hazardStats: [...state.hazardStats, newData],
    }));
  }

  private openModal() {
    this.setState({ modalShown: true });
  }

  private closeModal() {
    this.setState(() => ({ modalShown: false }));
  }

  private handleSelectionChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;

    this.setState({ selectedStatValue: value });
  }

  private calculateModifier() {
    const { selectedStatValue } = this.state;

    const modifier = determineDegreeOfSuccess(
      Number.parseInt(selectedStatValue, 10)
    );

    this.speedEl.currentValue = modifier.toString();
    this.speedEl.validValue = modifier;

    this.closeModal();
  }

  render() {
    const {
      currentName,
      nameWarningShown,
      expansionShown,
      mainStats,
      speedStats,
      hazardStats,
      modalShown,
    } = this.state;

    const selectSpeedStatModal = (
      <Modal
        className="Modal__Content"
        overlayClassName="Modal__Overlay"
        contentLabel="Select Speed Statistic"
        isOpen={modalShown}
        onRequestClose={this.closeModal}
      >
        <p>Select a speed skill</p>
        <form>
          {speedStats.map((data) => (
            <label>
              {data.title}
              <input
                type="radio"
                name="selectedStatValue"
                value={data.validValue}
                onChange={this.handleSelectionChange}
              />
            </label>
          ))}
          <input
            className="button button--secondary button--small"
            type="button"
            value="CANCEL"
            onClick={this.closeModal}
          />
          <input
            className="button button--primary button--small"
            type="button"
            value="CONFIRM"
            onClick={this.calculateModifier}
          />
        </form>
      </Modal>
    );

    const mainEl = (
      <div className="ParticipantRow__main-display">
        <label className="ParticipantRow__name-label input__label">
          Name
          <input
            type="text"
            value={currentName}
            onChange={this.handleNameChanged}
            onBlur={this.handleNameDeselected}
            className="ParticipantRow__name-input input"
          />
        </label>
        <p
          className="error"
          style={{
            visibility: nameWarningShown ? "visible" : "hidden",
          }}
        >
          {ParticipantRow.WARNING_MESSAGE}
        </p>
        <div className="ParticipantRow__footer">
          <div className="ParticipantRow__main-characteristics">
            {mainStats.map((data, index) =>
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
            onClick={this.handleViewToggling}
          >
            {expansionShown ? (
              <img src={ExpandLess} alt="Collapse" />
            ) : (
              <img src={ExpandMore} alt="Expand" />
            )}
          </Button>
        </div>
      </div>
    );

    const speedStatsEl = (
      <div>
        <h4>SPEED Stats</h4>
        {speedStats.map((data, index) =>
          DisplayFactory.createStatisticDisplay(
            "StatisticDisplay--horizontal",
            data,
            (value) => this.handleSpeedStatisticChange(index, value),
            () => this.handleSpeedStatisticBlur(index)
          )
        )}
        <Button
          className="button button--small button--primary"
          onClick={this.handleSpeedStatCreating}
        >
          <img src={Add} alt="Add Speed Stat" />
        </Button>
      </div>
    );

    const hazardStatsEl = (
      <div>
        <h4>HAZARD Stats</h4>
        {hazardStats.map((data, index) =>
          DisplayFactory.createStatisticDisplay(
            "StatisticDisplay--horizontal",
            data,
            (value) => this.handleHazardStatisticChange(index, value),
            () => this.handleHazardStatisticBlur(index)
          )
        )}
        <Button
          className="button button--small button--primary"
          onClick={this.handleHazardStatCreating}
        >
          <img src={Add} alt="Add Hazard Stat" />
        </Button>
      </div>
    );

    const extendedEl = (
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
              {speedStatsEl}
              {hazardStatsEl}
            </animated.div>
          ))
        }
      </Transition>
    );

    return (
      <div className="ParticipantRow">
        {mainEl}
        {extendedEl}
        {selectSpeedStatModal}
      </div>
    );
  }
}
