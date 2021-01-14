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
    upperLimit: Number.MAX_SAFE_INTEGER,
    upperWarning: null,
    lowerWarning: null,
    lowerLimit: Number.MIN_SAFE_INTEGER,
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

    const startingValueStr = this.props.startingValue.toString();
    this.checkValuePastUpperLimit(startingValueStr);
    this.checkValuePastLowerLimit(startingValueStr);

    this.state = {
      value: startingValueStr,
      lastValidValue: startingValueStr,
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
        throw new RangeError(
          `The given upper warning, '${this.props.upperWarning}', is greater than the given upper limit, '${this.props.upperLimit}'.`
        );
      } else if (this.props.upperWarning === this.props.upperLimit) {
        throw new RangeError(
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
        throw new RangeError(
          `The given lower warning, '${this.props.lowerWarning}', is less than the given lower limit, '${this.props.lowerLimit}'.`
        );
      } else if (this.props.lowerLimit === this.props.lowerWarning) {
        throw new RangeError(
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

  isValueWithinUpperWarning(value: string) {
    if (this.props.upperWarning === null) return false;

    return (
      Number.parseInt(value) >= this.props.upperWarning &&
      !this.isValueAtUpperLimit(value)
    );
  }

  isValueAtUpperLimit(value: string) {
    return Number.parseInt(value) === this.props.upperLimit;
  }

  checkValuePastUpperLimit(value: string) {
    const valueNum = Number.parseInt(value);

    if (valueNum > this.props.upperLimit)
      throw new RangeError(
        `The given value, '${valueNum}', is past the limit, '${this.props.upperLimit}'.`
      );
  }

  isValueWithinLowerWarning(value: string) {
    if (this.props.lowerWarning === null) return false;

    return (
      Number.parseInt(value) <= this.props.lowerWarning &&
      !this.isValueAtLowerLimit(value)
    );
  }

  isValueAtLowerLimit(value: string) {
    return Number.parseInt(value) === this.props.lowerLimit;
  }

  checkValuePastLowerLimit(value: string) {
    const valueNum = Number.parseInt(value);

    if (valueNum < this.props.lowerLimit)
      throw new RangeError(
        `The given value, '${valueNum}', is past the limit, '${this.props.lowerLimit}'.`
      );
  }

  render() {
    const labelID = sanitize(this.props.title) + "-" + this.id;
    const inputID = "input-" + this.id;

    let className = clsx({
      [UPPER_LIMIT_CLASS]: this.isValueAtUpperLimit(this.state.value),
      [UPPER_WARNING_CLASS]: this.isValueWithinUpperWarning(this.state.value),
      [LOWER_WARNING_CLASS]: this.isValueWithinLowerWarning(this.state.value),
      [LOWER_LIMIT_CLASS]: this.isValueAtLowerLimit(this.state.value),
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

    try {
      this.checkValuePastLowerLimit(value);
      this.checkValuePastUpperLimit(value);
      if (value != "") this.setState({ lastValidValue: value });
    } catch (error) {
      const valueNum = Number.parseInt(value);
      if (valueNum > this.props.upperLimit)
        this.setState({ lastValidValue: this.props.upperLimit.toString() });
      else if (valueNum < this.props.lowerLimit)
        this.setState({ lastValidValue: this.props.lowerLimit.toString() });
    }

    this.setState({ value: value });
  }

  private handleBlur() {
    this.setState((state) => ({ value: state.lastValidValue }));
  }
}
