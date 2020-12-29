import React from "react";

import { v4 as uuidv4 } from "uuid";

import "./index.css";

interface StatisticDisplayProps {
  title: string;
  startingValue: number;
}

interface StatisticDisplayState {}

export default class StatisticDisplay extends React.Component<
  StatisticDisplayProps,
  StatisticDisplayState
> {
  private id: string;

  constructor(props: StatisticDisplayProps) {
    super(props);

    this.id = uuidv4();
  }

  sanitize(str: string): string {
    str = str.replace(/[^a-z0-9_-]/gim, "");
    return str.trim();
  }

  render() {
    return (
      <div className="display">
        <label id={this.sanitize(this.props.title) + "-" + this.id}>
          {this.props.title}
        </label>
        <p aria-labelledby={this.sanitize(this.props.title) + "-" + this.id}>
          {this.props.startingValue}
        </p>
      </div>
    );
  }
}
