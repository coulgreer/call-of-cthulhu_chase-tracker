import React from "react";

import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";

import { sanitize } from "../../utils/lib/sanitizer";

import "./index.css";

const LOWER_WARNING_CLASS = "statistic-display-lower-warning";
const LOWER_LIMIT_CLASS = "statistic-display-lower-limit";

interface StatisticDisplayProps {
  title: string;
  startingValue: number;
  lowerWarning: number;
  lowerLimit: number;
}

export default class StatisticDisplay extends React.Component<StatisticDisplayProps> {
  static defaultProps = { lowerWarning: null, lowerLimit: null };

  static get LOWER_WARNING_CLASS() {
    return LOWER_WARNING_CLASS;
  }

  static get LOWER_LIMIT_CLASS() {
    return LOWER_LIMIT_CLASS;
  }

  private id: string;

  constructor(props: StatisticDisplayProps) {
    super(props);

    this.id = uuidv4();
  }

  isValueInLowerWarning() {
    if (!this.props.lowerWarning) return false;

    return (
      this.props.startingValue <= this.props.lowerWarning &&
      !(this.props.startingValue <= this.props.lowerLimit)
    );
  }

  isValueInLowerLimit() {
    if (!this.props.lowerLimit) return false;

    return this.props.startingValue <= this.props.lowerLimit;
  }

  render() {
    const labelID = sanitize(this.props.title) + "-" + this.id;
    const className = clsx({
      [LOWER_WARNING_CLASS]: this.isValueInLowerWarning(),
      [LOWER_LIMIT_CLASS]: this.isValueInLowerLimit(),
    });

    return (
      <div className="statistic-display">
        <label id={labelID}>{this.props.title}</label>
        <p aria-labelledby={labelID} className={className}>
          {this.props.startingValue}
        </p>
      </div>
    );
  }
}
