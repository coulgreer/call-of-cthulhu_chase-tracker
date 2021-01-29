import React from "react";

import { v4 as uuidv4 } from "uuid";

import StatisticDisplay from "../StatisticDisplay";

import "./ParticipantRow.css";

interface Props {
  defaultParticipantName: string;
}

interface State {
  currentName: string;
  lastValidName: string;
  isNameWarningShown: boolean;
}

export default class ParticipantRow extends React.Component<Props, State> {
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

  static get WARNING_MESSAGE() {
    return "A pity. Even Ancient Ones have a name. You ought follow suit.";
  }

  private id: string;

  constructor(props: Props) {
    super(props);

    this.state = {
      currentName: this.props.defaultParticipantName,
      lastValidName: this.props.defaultParticipantName,
      isNameWarningShown: false,
    };

    this.id = uuidv4();

    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  render() {
    return (
      <div className="ParticipantRow">
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
            visibility: this.state.isNameWarningShown ? "visible" : "hidden",
          }}
        >
          {ParticipantRow.WARNING_MESSAGE}
        </p>
        <div className="ParticipantRow__main-characteristics">
          <StatisticDisplay
            title={ParticipantRow.DEX_TITLE}
            lowerWarning={0}
            upperWarning={100}
            startingValue={15}
          />
          <StatisticDisplay
            title={ParticipantRow.MOV_TITLE}
            lowerWarning={1}
            upperWarning={10}
            startingValue={2}
          />
        </div>
        <div className="ParticipantRow__speed-stats">
          <StatisticDisplay
            title={ParticipantRow.CON_TITLE}
            lowerWarning={0}
            upperWarning={100}
            startingValue={15}
          />
          <StatisticDisplay
            title={ParticipantRow.DRIVE_TITLE}
            lowerWarning={0}
            upperWarning={100}
            startingValue={20}
          />
          <StatisticDisplay
            title={ParticipantRow.RIDE_TITLE}
            lowerWarning={0}
            upperWarning={100}
            startingValue={5}
          />
          <StatisticDisplay
            title={ParticipantRow.AIR_TITLE}
            lowerWarning={0}
            upperWarning={100}
            startingValue={1}
          />
          <StatisticDisplay
            title={ParticipantRow.SEA_TITLE}
            lowerWarning={0}
            upperWarning={100}
            startingValue={1}
          />
        </div>
      </div>
    );
  }

  private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.currentTarget.value;

    if (value.trim()) {
      this.setState(() => ({
        lastValidName: value,
        isNameWarningShown: false,
      }));
    } else {
      this.setState(() => ({ isNameWarningShown: true }));
    }

    this.setState(() => ({ currentName: value }));
  }

  private handleBlur() {
    this.setState((state) => ({
      currentName: state.lastValidName,
      isNameWarningShown: false,
    }));
  }
}
