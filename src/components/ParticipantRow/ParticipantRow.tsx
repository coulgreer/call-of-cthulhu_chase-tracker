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
      nameWarningShown: false,
      expansionShown: false,
    };

    this.id = uuidv4();

    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.toggleExpansion = this.toggleExpansion.bind(this);
  }

  render() {
    return (
      <div className="ParticipantRow">
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
                <h3>Speed STATS</h3>
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
              </animated.div>
            ))
          }
        </Transition>
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
