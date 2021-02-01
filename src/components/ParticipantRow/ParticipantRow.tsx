import React from "react";
import { Transition, animated } from "react-spring/renderprops";

import { v4 as uuidv4 } from "uuid";

import Button from "../Button";
import StatisticDisplay from "../StatisticDisplay";

import ExpandLess from "../../images/baseline_expand_less_black_24dp.png";
import ExpandMore from "../../images/baseline_expand_more_black_24dp.png";

import "./ParticipantRow.css";

interface Props {
  defaultParticipantName: string;
}

interface State {
  currentName: string;
  lastValidName: string;
  nameWarningShown: boolean;
  expansionShown: boolean;
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
    return "A pity. Even Ancient Ones have a name. You ought follow suit.";
  }

  private id: string;

  constructor(props: Props) {
    super(props);

    this.state = {
      currentName: this.props.defaultParticipantName,
      lastValidName: this.props.defaultParticipantName,
      nameWarningShown: false,
      expansionShown: false,
    };

    this.id = uuidv4();

    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.toggleExpansion = this.toggleExpansion.bind(this);
  }

  render() {
    const mainEl = (
      <div className="ParticipantRow__main-display">
        <label
          htmlFor={this.id}
          className="ParticipantRow__name-label input__label"
        >
          Name
        </label>
        <input
          id={this.id}
          type="text"
          value={this.state.currentName}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          className="ParticipantRow__name-input input"
        />
        <p
          className="error"
          style={{
            visibility: this.state.nameWarningShown ? "visible" : "hidden",
          }}
        >
          {ParticipantRow.WARNING_MESSAGE}
        </p>
        <div className="ParticipantRow__footer">
          <div className="ParticipantRow__main-characteristics">
            <StatisticDisplay
              title={ParticipantRow.DEX_TITLE}
              lowerWarning={ParticipantRow.MIN_PERCENTILE - 1}
              upperWarning={ParticipantRow.MAX_PERCENTILE}
              startingValue={15}
            />
            <StatisticDisplay
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
            {this.state.expansionShown ? (
              <img src={ExpandLess} alt="Collapse" />
            ) : (
              <img src={ExpandMore} alt="Expand" />
            )}
          </Button>
        </div>
      </div>
    );

    const extendedEl = (
      <Transition
        native
        items={this.state.expansionShown}
        from={{ height: 0, overflow: "hidden" }}
        enter={{ height: "auto" }}
        leave={{ height: 0 }}
      >
        {(expansionShown) =>
          expansionShown &&
          ((props) => (
            <animated.div
              className="ParticipantRow__extended-display"
              style={props}
            >
              {speedStatsEl}
              {miscStatsEl}
            </animated.div>
          ))
        }
      </Transition>
    );

    const speedStatsEl = (
      <div>
        <h4>Speed STATS</h4>
        <StatisticDisplay
          title={ParticipantRow.CON_TITLE}
          lowerWarning={ParticipantRow.MIN_PERCENTILE - 1}
          upperWarning={ParticipantRow.MAX_PERCENTILE}
          startingValue={15}
        />
        <StatisticDisplay
          title={ParticipantRow.DRIVE_TITLE}
          lowerWarning={ParticipantRow.MIN_PERCENTILE - 1}
          upperWarning={ParticipantRow.MAX_PERCENTILE}
          startingValue={20}
        />
        <StatisticDisplay
          title={ParticipantRow.RIDE_TITLE}
          lowerWarning={ParticipantRow.MIN_PERCENTILE - 1}
          upperWarning={ParticipantRow.MAX_PERCENTILE}
          startingValue={5}
        />
        <StatisticDisplay
          title={ParticipantRow.AIR_TITLE}
          lowerWarning={ParticipantRow.MIN_PERCENTILE - 1}
          upperWarning={ParticipantRow.MAX_PERCENTILE}
          startingValue={1}
        />
        <StatisticDisplay
          title={ParticipantRow.SEA_TITLE}
          lowerWarning={ParticipantRow.MIN_PERCENTILE - 1}
          upperWarning={ParticipantRow.MAX_PERCENTILE}
          startingValue={1}
        />
      </div>
    );

    const miscStatsEl = (
      <div>
        <h4>Misc. STATS</h4>
        <StatisticDisplay
          title={ParticipantRow.STR_TITLE}
          lowerWarning={ParticipantRow.MIN_PERCENTILE - 1}
          upperWarning={ParticipantRow.MAX_PERCENTILE}
          startingValue={15}
        />
        <StatisticDisplay
          title={ParticipantRow.CLIMB_TITLE}
          lowerWarning={ParticipantRow.MIN_PERCENTILE - 1}
          upperWarning={ParticipantRow.MAX_PERCENTILE}
          startingValue={20}
        />
        <StatisticDisplay
          title={ParticipantRow.SWIM_TITLE}
          lowerWarning={ParticipantRow.MIN_PERCENTILE - 1}
          upperWarning={ParticipantRow.MAX_PERCENTILE}
          startingValue={20}
        />
        <StatisticDisplay
          title={ParticipantRow.DODGE_TITLE}
          lowerWarning={ParticipantRow.MIN_PERCENTILE - 1}
          upperWarning={ParticipantRow.MAX_PERCENTILE}
          startingValue={7}
        />
        <StatisticDisplay
          title={ParticipantRow.BRAWL_TITLE}
          lowerWarning={ParticipantRow.MIN_PERCENTILE - 1}
          upperWarning={ParticipantRow.MAX_PERCENTILE}
          startingValue={25}
        />
        <StatisticDisplay
          title={ParticipantRow.HANDGUN_TITLE}
          lowerWarning={ParticipantRow.MIN_PERCENTILE - 1}
          upperWarning={ParticipantRow.MAX_PERCENTILE}
          startingValue={20}
        />
        <StatisticDisplay
          title={ParticipantRow.RIFLE_TITLE}
          lowerWarning={ParticipantRow.MIN_PERCENTILE - 1}
          upperWarning={ParticipantRow.MAX_PERCENTILE}
          startingValue={25}
        />
      </div>
    );

    return (
      <div className="ParticipantRow">
        {mainEl}
        {extendedEl}
      </div>
    );
  }

  private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.currentTarget.value;

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
}
