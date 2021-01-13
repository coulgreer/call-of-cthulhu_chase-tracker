import React from "react";

import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";

import { sanitize } from "../../utils/sanitizer";
import Range from "../../utils/range";

import "./index.css";

const UPPER_LIMIT_CLASS = "statistic-display-upper-limit";
const UPPER_WARNING_CLASS = "statistic-display-upper-warning";
const LOWER_WARNING_CLASS = "statistic-display-lower-warning";
const LOWER_LIMIT_CLASS = "statistic-display-lower-limit";

interface StatisticDisplayProps {
  title: string;
  startingValue: number;
  upperLimit: number;
  upperWarning: number;
  lowerWarning: number;
  lowerLimit: number;
}

export default class StatisticDisplay extends React.Component<StatisticDisplayProps> {
  static defaultProps = {
    upperLimit: null,
    upperWarning: null,
    lowerWarning: null,
    lowerLimit: null,
  };

  static get UPPER_LIMIT_CLASS() {
    return UPPER_LIMIT_CLASS;
  }

  static get UPPER_WARNING_CLASS() {
    return UPPER_WARNING_CLASS;
  }

  static get LOWER_WARNING_CLASS() {
    return LOWER_WARNING_CLASS;
  }

  static get LOWER_LIMIT_CLASS() {
    return LOWER_LIMIT_CLASS;
  }
  private id: string;

  constructor(props: StatisticDisplayProps) {
    super(props);

    const upperRange = this.generateUpperBound();
    const lowerRange = this.generateLowerBound();
    if (Range.hasIntersection(upperRange, lowerRange)) {
      throw new Error(
        `There is an intersection between the upper and lower bounds.`
      );
    }

    this.id = uuidv4();
  }

  private generateUpperBound(): Range | null {
    if (!this.props.upperLimit && !this.props.upperWarning) return null;

    if (this.props.upperLimit && this.props.upperWarning) {
      if (this.props.upperWarning > this.props.upperLimit) {
        throw new Error(
          `The given upper warning, '${this.props.upperWarning}', is greater than the given upper limit, '${this.props.upperLimit}'.`
        );
      } else if (this.props.upperWarning === this.props.upperLimit) {
        throw new Error(
          `The given upper warning, '${this.props.upperWarning}', is equal to the given upper limit, '${this.props.upperLimit}'. The limit should be greater than the warning threshold.`
        );
      }
    }

    const end = this.props.upperLimit
      ? this.props.upperLimit
      : Number.MAX_SAFE_INTEGER;
    const start = this.props.upperWarning ? this.props.upperWarning : end;

    return new Range(start, end);
  }

  private generateLowerBound(): Range | null {
    if (!this.props.lowerLimit && !this.props.lowerWarning) return null;

    if (this.props.lowerLimit && this.props.lowerWarning) {
      if (this.props.lowerWarning < this.props.lowerLimit) {
        throw new Error(
          `The given lower warning, '${this.props.lowerWarning}', is less than the given lower limit, '${this.props.lowerLimit}'.`
        );
      } else if (this.props.lowerLimit === this.props.lowerWarning) {
        throw new Error(
          `The given lower warning, '${this.props.lowerWarning}', is equal to the given lower limit, '${this.props.lowerLimit}'. The limit should be less than the warning threshold.`
        );
      }
    }

    const end = this.props.lowerLimit
      ? this.props.lowerLimit
      : Number.MIN_SAFE_INTEGER;
    const start = this.props.lowerWarning ? this.props.lowerWarning : end;

    return new Range(start, end);
  }

  isValueAtUpperLimit() {
    if (!this.props.upperLimit) return false;

    if (this.props.startingValue > this.props.upperLimit)
      throw new Error(
        `The given value, '${this.props.startingValue}', is past the limit, '${this.props.upperLimit}'.`
      );

    return this.props.startingValue === this.props.upperLimit;
  }

  isValueWithinUpperWarning() {
    if (!this.props.upperWarning) return false;

    return (
      this.props.startingValue >= this.props.upperWarning &&
      !this.isValueAtUpperLimit()
    );
  }

  isValueAtLowerLimit() {
    if (!this.props.lowerLimit) return false;

    if (this.props.startingValue < this.props.lowerLimit)
      throw new Error(
        `The given value, '${this.props.startingValue}', is past the limit, '${this.props.lowerLimit}'.`
      );

    return this.props.startingValue === this.props.lowerLimit;
  }

  isValueWithinLowerWarning() {
    if (!this.props.lowerWarning) return false;

    return (
      this.props.startingValue <= this.props.lowerWarning &&
      !this.isValueAtLowerLimit()
    );
  }

  render() {
    const labelID = sanitize(this.props.title) + "-" + this.id;
    const inputID = "input-" + this.id;
    const className = clsx({
      [UPPER_LIMIT_CLASS]: this.isValueAtUpperLimit(),
      [UPPER_WARNING_CLASS]: this.isValueWithinUpperWarning(),
      [LOWER_WARNING_CLASS]: this.isValueWithinLowerWarning(),
      [LOWER_LIMIT_CLASS]: this.isValueAtLowerLimit(),
    });

    return (
      <div className="statistic-display">
        <label htmlFor={inputID} id={labelID}>
          {this.props.title}
        </label>
        <input
          type="number"
          id={inputID}
          className={className}
          defaultValue={this.props.startingValue}
        />
      </div>
    );
  }
}
