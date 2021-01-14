import React from "react";

import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";

import { sanitize } from "../../utils/sanitizer";
import Range from "../../utils/range";

import "./index.css";

const UPPER_LIMIT_CLASS = "upper-limit";
const UPPER_WARNING_CLASS = "upper-warning";
const LOWER_WARNING_CLASS = "lower-warning";
const LOWER_LIMIT_CLASS = "lower-limit";

interface Props {
  title: string;
  startingValue: number;
  upperLimit: number;
  upperWarning: number;
  lowerWarning: number;
  lowerLimit: number;
}

interface State {
  value: string;
  lastValidValue: string;
}

export default class StatisticDisplay extends React.Component<Props, State> {
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

  constructor(props: Props) {
    super(props);

    this.state = {
      value: this.props.startingValue.toString(),
      lastValidValue: this.props.startingValue.toString(),
    };

    const upperRange = this.generateUpperBound();
    const lowerRange = this.generateLowerBound();
    if (Range.hasIntersection(upperRange, lowerRange)) {
      throw new Error(
        `There is an intersection between the upper and lower bounds.`
      );
    }

    this.id = uuidv4();

    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  private generateUpperBound(): Range | null {
    if (this.props.upperLimit === null && this.props.upperWarning === null)
      return null;

    if (this.props.upperLimit !== null && this.props.upperWarning !== null) {
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

    const end =
      this.props.upperLimit !== null
        ? this.props.upperLimit
        : Number.MAX_SAFE_INTEGER;
    const start =
      this.props.upperWarning !== null ? this.props.upperWarning : end;

    return new Range(start, end);
  }

  private generateLowerBound(): Range | null {
    if (this.props.lowerLimit === null && this.props.lowerWarning === null)
      return null;

    if (this.props.lowerLimit !== null && this.props.lowerWarning !== null) {
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

    const end =
      this.props.lowerLimit !== null
        ? this.props.lowerLimit
        : Number.MIN_SAFE_INTEGER;
    const start =
      this.props.lowerWarning !== null ? this.props.lowerWarning : end;

    return new Range(start, end);
  }

  isValueWithinUpperWarning() {
    if (this.props.upperWarning === null) return false;

    return (
      Number.parseInt(this.state.value) >= this.props.upperWarning &&
      !this.isValueAtUpperLimit()
    );
  }

  isValueAtUpperLimit() {
    if (this.props.upperLimit === null) return false;

    const valueNum = Number.parseInt(this.state.value);

    if (valueNum > this.props.upperLimit)
      throw new Error(
        `The given value, '${this.props.startingValue}', is past the limit, '${this.props.upperLimit}'.`
      );

    return valueNum === this.props.upperLimit;
  }

  isValueWithinLowerWarning() {
    if (this.props.lowerWarning === null) return false;

    return (
      Number.parseInt(this.state.value) <= this.props.lowerWarning &&
      !this.isValueAtLowerLimit()
    );
  }

  isValueAtLowerLimit() {
    if (this.props.lowerLimit === null) return false;

    const valueNum = Number.parseInt(this.state.value);

    if (valueNum < this.props.lowerLimit)
      throw new Error(
        `The given value, '${this.props.startingValue}', is past the limit, '${this.props.lowerLimit}'.`
      );

    return valueNum === this.props.lowerLimit;
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
          value={this.state.value}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
        />
      </div>
    );
  }

  private handleChange(event: React.FormEvent<HTMLInputElement>) {
    const value = event.currentTarget.value;

    if (value != "") this.setState({ lastValidValue: value });
    this.setState({ value: value });
  }

  private handleBlur() {
    this.setState((state) => ({ value: state.lastValidValue }));
  }
}
