import React, { ReactNode } from "react";
import { Transition, animated } from "react-spring/renderprops";

import Button from "../Button";
import StatisticDisplay from "../StatisticDisplay";

import Add from "../../images/baseline_add_black_36dp_x1.png";
import ExpandLess from "../../images/baseline_expand_less_black_24dp.png";
import ExpandMore from "../../images/baseline_expand_more_black_24dp.png";

import "./ParticipantRow.css";
import UniqueSequenceGenerator from "../../utils/unique-sequence-generator";

interface Props {
  defaultParticipantName: string;
}

interface State {
  currentName: string;
  lastValidName: string;
  nameWarningShown: boolean;
  expansionShown: boolean;
  speedStats: ReactNode[];
  hazardStats: ReactNode[];
}

export default class ParticipantRow extends React.Component<Props, State> {
  static get MAX_PERCENTILE() {
    return 100;
  }

  static get MIN_PERCENTILE() {
    return 1;
  }

  static get DEX_TITLE() {
    return "DEX";
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

  private speedStatSequence: UniqueSequenceGenerator;

  private hazardStatSequence: UniqueSequenceGenerator;

  constructor(props: Props) {
    super(props);

    const { defaultParticipantName } = this.props;

    this.speedStatSequence = new UniqueSequenceGenerator(0);
    this.hazardStatSequence = new UniqueSequenceGenerator(0);

    this.state = {
      currentName: defaultParticipantName,
      lastValidName: defaultParticipantName,
      nameWarningShown: false,
      expansionShown: false,
      speedStats: this.initializeSpeedStats(),
      hazardStats: this.initializeHazardStats(),
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.toggleExpansion = this.toggleExpansion.bind(this);
    this.handleSpeedClick = this.handleSpeedClick.bind(this);
    this.handleHazardClick = this.handleHazardClick.bind(this);
  }

  private initializeSpeedStats() {
    return [
      this.createSpeedStatistic(ParticipantRow.CON_TITLE, 15),
      this.createSpeedStatistic(ParticipantRow.DRIVE_TITLE, 20),
      this.createSpeedStatistic(ParticipantRow.RIDE_TITLE, 5),
      this.createSpeedStatistic(ParticipantRow.AIR_TITLE, 1),
      this.createSpeedStatistic(ParticipantRow.SEA_TITLE, 1),
    ];
  }

  private initializeHazardStats() {
    return [
      this.createHazardStatistic(ParticipantRow.STR_TITLE, 15),
      this.createHazardStatistic(ParticipantRow.CLIMB_TITLE, 20),
      this.createHazardStatistic(ParticipantRow.SWIM_TITLE, 20),
      this.createHazardStatistic(ParticipantRow.DODGE_TITLE, 7),
      this.createHazardStatistic(ParticipantRow.BRAWL_TITLE, 25),
      this.createHazardStatistic(ParticipantRow.HANDGUN_TITLE, 20),
      this.createHazardStatistic(ParticipantRow.RIFLE_TITLE, 25),
    ];
  }

  private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
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

  private handleBlur() {
    this.setState((state) => ({
      currentName: state.lastValidName,
      nameWarningShown: false,
    }));
  }

  private toggleExpansion() {
    this.setState((state) => ({
      expansionShown: !state.expansionShown,
    }));
  }

  private handleSpeedClick() {
    const key = this.speedStatSequence.nextNum();
    const newSkill = (
      <StatisticDisplay
        title={`${ParticipantRow.DEFAULT_STAT_NAME} #${key}`}
        lowerWarning={ParticipantRow.MIN_PERCENTILE - 1}
        upperWarning={ParticipantRow.MAX_PERCENTILE}
        startingValue={15}
        key={key}
      />
    );
    this.setState((state) => ({
      speedStats: [...state.speedStats, newSkill],
    }));
  }

  private handleHazardClick() {
    const key = this.hazardStatSequence.nextNum();
    const newSkill = (
      <StatisticDisplay
        title={`${ParticipantRow.DEFAULT_STAT_NAME} #${key}`}
        lowerWarning={ParticipantRow.MIN_PERCENTILE - 1}
        upperWarning={ParticipantRow.MAX_PERCENTILE}
        startingValue={15}
        key={key}
      />
    );
    this.setState((state) => ({
      hazardStats: [...state.hazardStats, newSkill],
    }));
  }

  private createSpeedStatistic(title: string, startingValue: number) {
    return (
      <StatisticDisplay
        className="StatisticDisplay--horizontal"
        title={title}
        lowerWarning={ParticipantRow.MIN_PERCENTILE - 1}
        upperWarning={ParticipantRow.MAX_PERCENTILE}
        startingValue={startingValue}
        key={this.speedStatSequence.nextNum()}
      />
    );
  }

  private createHazardStatistic(title: string, startingValue: number) {
    return (
      <StatisticDisplay
        className="StatisticDisplay--horizontal"
        title={title}
        lowerWarning={ParticipantRow.MIN_PERCENTILE - 1}
        upperWarning={ParticipantRow.MAX_PERCENTILE}
        startingValue={startingValue}
        key={this.hazardStatSequence.nextNum()}
      />
    );
  }

  render() {
    const {
      currentName,
      nameWarningShown,
      expansionShown,
      speedStats,
      hazardStats,
    } = this.state;

    const mainEl = (
      <div className="ParticipantRow__main-display">
        <label className="ParticipantRow__name-label input__label">
          Name
          <input
            type="text"
            value={currentName}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
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
            <StatisticDisplay
              className="StatisticDisplay--vertical"
              title={ParticipantRow.DEX_TITLE}
              lowerWarning={ParticipantRow.MIN_PERCENTILE - 1}
              upperWarning={ParticipantRow.MAX_PERCENTILE}
              startingValue={15}
            />
            <StatisticDisplay
              className="StatisticDisplay--vertical"
              title="Speed"
              startingValue={0}
            />
            <StatisticDisplay
              className="StatisticDisplay--vertical"
              title={ParticipantRow.MOV_TITLE}
              lowerWarning={1}
              upperWarning={10}
              startingValue={2}
            />
          </div>
          <Button
            className="button button--primary button--small button--circular"
            onClick={this.toggleExpansion}
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
        {speedStats}
        <Button
          className="button button--small button--primary"
          onClick={this.handleSpeedClick}
        >
          <img src={Add} alt="Add Speed Stat" />
        </Button>
      </div>
    );

    const hazardStatsEl = (
      <div>
        <h4>HAZARD Stats</h4>
        {hazardStats}
        <Button
          className="button button--small button--primary"
          onClick={this.handleHazardClick}
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
      </div>
    );
  }
}
