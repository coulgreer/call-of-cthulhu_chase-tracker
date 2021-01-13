import React from "react";

import StatisticDisplay from "../StatisticDisplay";

interface ParticipantRowProps {
  participantName: string;
}

const DEX_TITLE = "DEX";
const MOV_TITLE = "MOV";

export default class ParticipantRow extends React.Component<ParticipantRowProps> {
  static get DEX_TITLE() {
    return DEX_TITLE;
  }
  static get MOV_TITLE() {
    return MOV_TITLE;
  }

  constructor(props: ParticipantRowProps) {
    super(props);
  }

  render() {
    return (
      <div className="participant-row">
        <h2>{this.props.participantName}</h2>
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
}
