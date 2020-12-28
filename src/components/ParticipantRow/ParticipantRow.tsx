import React from "react";

import StatisticDisplay from "../StatisticDisplay";

interface ParticipantRowProps {
  participantName: string;
}

interface ParticpantRowState {
  dexScore: number;
  movScore: number;
  isExpanded: boolean;
}

export default class ParticipantRow extends React.Component<
  ParticipantRowProps,
  ParticpantRowState
> {
  constructor(props: ParticipantRowProps) {
    super(props);
    this.state = {
      dexScore: 0,
      movScore: 0,
      isExpanded: false,
    };
  }

  render() {
    return (
      <>
        <h1>{this.props.participantName}</h1>
        <StatisticDisplay title={"DEX"} startingValue={0} />
        <StatisticDisplay title={"MOV"} startingValue={0} />
      </>
    );
  }
}
