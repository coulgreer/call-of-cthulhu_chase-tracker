import React from "react";

import { v4 as uuidv4 } from "uuid";

import { sanitize } from "../../utils/lib/sanitizer";

import "./index.css";

interface StatisticDisplayProps {
  title: string;
  startingValue: number;
}

export default class StatisticDisplay extends React.Component<StatisticDisplayProps> {
  private id: string;

  constructor(props: StatisticDisplayProps) {
    super(props);

    this.id = uuidv4();
  }

  render() {
    const labelID = sanitize(this.props.title) + "-" + this.id;

    return (
      <div className="statistic-display">
        <label id={labelID}>{this.props.title}</label>
        <p aria-labelledby={labelID}>{this.props.startingValue}</p>
      </div>
    );
  }
}
