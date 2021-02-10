import React from "react";
import clsx from "clsx";

import Range from "../../utils/range";

import "./StatisticDisplay.css";

interface Props {
  className: string;
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
    className: "",
    upperLimit: Number.MAX_SAFE_INTEGER,
    upperWarning: null,
    lowerWarning: null,
    lowerLimit: Number.MIN_SAFE_INTEGER,
  };

  static get UPPER_LIMIT_CLASS() {
    return "StatisticDisplay--upper-limit";
  }

  static get UPPER_WARNING_CLASS() {
    return "StatisticDisplay--upper-warning";
  }

  static get LOWER_WARNING_CLASS() {
    return "StatisticDisplay--lower-warning";
  }

  static get LOWER_LIMIT_CLASS() {
    return "StatisticDisplay--lower-limit";
  }

  constructor(props: Props) {
    super(props);

    const { startingValue } = this.props;

    this.validateStartingValue();
    const startingValueStr = startingValue.toString();

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

    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  private validateStartingValue() {
    const { startingValue, upperLimit, lowerLimit } = this.props;

    if (startingValue > upperLimit) {
      throw new RangeError(
        `The given value, '${startingValue}', is past the limit, '${upperLimit}'.`
      );
    } else if (startingValue < lowerLimit) {
      throw new RangeError(
        `The given value, '${startingValue}', is past the limit, '${lowerLimit}'.`
      );
    }
  }

  private generateUpperBound(): Range | null {
    const { upperLimit, upperWarning } = this.props;

    if (upperLimit === null && upperWarning === null) return null;

    if (upperLimit !== null && upperWarning !== null) {
      if (upperWarning > upperLimit) {
        throw new RangeError(
          `The given upper warning, '${upperWarning}', is greater than the given upper limit, '${upperLimit}'.`
        );
      } else if (upperWarning === upperLimit) {
        throw new RangeError(
          `The given upper warning, '${upperWarning}', is equal to the given upper limit, '${upperLimit}'. The limit should be greater than the warning threshold.`
        );
      }
    }

    const end = upperLimit !== null ? upperLimit : Number.MAX_SAFE_INTEGER;
    const start = upperWarning !== null ? upperWarning : end;

    return new Range(start, end);
  }

  private generateLowerBound(): Range | null {
    const { lowerLimit, lowerWarning } = this.props;

    if (lowerLimit === null && lowerWarning === null) return null;

    if (lowerLimit !== null && lowerWarning !== null) {
      if (lowerWarning < lowerLimit) {
        throw new RangeError(
          `The given lower warning, '${lowerWarning}', is less than the given lower limit, '${lowerLimit}'.`
        );
      } else if (lowerLimit === lowerWarning) {
        throw new RangeError(
          `The given lower warning, '${lowerWarning}', is equal to the given lower limit, '${lowerLimit}'. The limit should be less than the warning threshold.`
        );
      }
    }

    const end = lowerLimit !== null ? lowerLimit : Number.MIN_SAFE_INTEGER;
    const start = lowerWarning !== null ? lowerWarning : end;

    return new Range(start, end);
  }

  isValueWithinUpperWarning(value: string) {
    const { upperWarning } = this.props;

    if (upperWarning === null) return false;

    return (
      Number.parseInt(value, 10) >= upperWarning &&
      !this.isValueAtUpperLimit(value)
    );
  }

  isValueAtUpperLimit(value: string) {
    const { upperLimit } = this.props;

    return Number.parseInt(value, 10) === upperLimit;
  }

  isAboveUpperLimit(value: string) {
    const { upperLimit } = this.props;

    return Number.parseInt(value, 10) > upperLimit;
  }

  isValueWithinLowerWarning(value: string) {
    const { lowerWarning } = this.props;

    if (lowerWarning === null) return false;

    return (
      Number.parseInt(value, 10) <= lowerWarning &&
      !this.isValueAtLowerLimit(value)
    );
  }

  isValueAtLowerLimit(value: string) {
    const { lowerLimit } = this.props;

    return Number.parseInt(value, 10) === lowerLimit;
  }

  isBelowLowerLimit(value: string) {
    const { lowerLimit } = this.props;

    return Number.parseInt(value, 10) < lowerLimit;
  }

  private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { upperLimit, lowerLimit } = this.props;
    const { value } = event.currentTarget;

    if (value !== "") {
      if (this.isAboveUpperLimit(value)) {
        this.setState({ lastValidValue: upperLimit.toString() });
      } else if (this.isBelowLowerLimit(value)) {
        this.setState({ lastValidValue: lowerLimit.toString() });
      } else {
        this.setState({ lastValidValue: value });
      }
    }

    this.setState({ value });
  }

  private handleBlur() {
    this.setState((state) => ({ value: state.lastValidValue }));
  }

  render() {
    const { title, className } = this.props;
    const { value } = this.state;

    const inputClassName = clsx({
      [StatisticDisplay.UPPER_LIMIT_CLASS]: this.isValueAtUpperLimit(value),
      [StatisticDisplay.UPPER_WARNING_CLASS]: this.isValueWithinUpperWarning(
        value
      ),
      [StatisticDisplay.LOWER_WARNING_CLASS]: this.isValueWithinLowerWarning(
        value
      ),
      [StatisticDisplay.LOWER_LIMIT_CLASS]: this.isValueAtLowerLimit(value),
    });

    return (
      <label
        className={`StatisticDisplay StatisticDisplay__label input__label ${className}`}
      >
        {title}
        <input
          type="number"
          className={`StatisticDisplay__input input ${inputClassName}`}
          value={value}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
        />
      </label>
    );
  }
}
