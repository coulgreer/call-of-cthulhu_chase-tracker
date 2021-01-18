import React from "react";

import StatisticDisplay from "../StatisticDisplay";

interface Props {
  defaultParticipantName: string;
}

interface State {
  currentName: string;
  lastValidName: string;
  isNameWarningShown: boolean;
}

const DEX_TITLE = "DEX";
const MOV_TITLE = "MOV";
const WARNING_MESSAGE =
  "A pity. Even Ancient Ones have a name. You ought follow suit.";

export default class ParticipantRow extends React.Component<Props, State> {
  static get DEX_TITLE() {
    return DEX_TITLE;
  }
  static get MOV_TITLE() {
    return MOV_TITLE;
  }

  static get WARNING_MESSAGE() {
    return WARNING_MESSAGE;
  }

  constructor(props: Props) {
    super(props);

    this.state = {
      currentName: this.props.defaultParticipantName,
      lastValidName: this.props.defaultParticipantName,
      isNameWarningShown: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  render() {
    return (
      <div className="participant-row">
        <label>
          Name
          <input
            type="text"
            value={this.state.currentName}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
          />
        </label>
        {this.state.isNameWarningShown && (
          <p>{ParticipantRow.WARNING_MESSAGE}</p>
        )}
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
