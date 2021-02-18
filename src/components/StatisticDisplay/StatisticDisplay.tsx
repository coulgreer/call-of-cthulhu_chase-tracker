import React from "react";
import clsx from "clsx";

import Range from "../../utils/range";

import "./StatisticDisplay.css";

export interface Data {
  title: string;
  currentValue: string;
  validValue: number;
  upperLimit?: number;
  upperWarning?: number;
  lowerWarning?: number;
  lowerLimit?: number;
  key?: number;
}

interface Props {
  className: string;
  title: string;
  currentValue: string;
  upperLimit: number;
  upperWarning: number;
  lowerWarning: number;
  lowerLimit: number;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export default class StatisticDisplay extends React.Component<Props> {
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

    const { currentValue, lowerLimit, upperLimit } = this.props;

    const upperRange = this.generateUpperBound();
    const lowerRange = this.generateLowerBound();
    if (Range.hasIntersection(upperRange, lowerRange)) {
      throw new Error(
        `There is an intersection between the upper and lower bounds.`
      );
    }

    const currentValueNum = Number.parseInt(currentValue, 10);
    if (
      this.isAboveUpperLimit(currentValueNum) ||
      this.isBelowLowerLimit(currentValueNum)
    ) {
      throw new Error(
        `The value, ${currentValue}, is outside the defined bounds of ${upperLimit} and ${lowerLimit}`
      );
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
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

  isValueWithinUpperWarning(value: number) {
    const { upperWarning } = this.props;

    if (upperWarning === null) return false;

    return value >= upperWarning && !this.isValueAtUpperLimit(value);
  }

  isValueAtUpperLimit(value: number) {
    const { upperLimit } = this.props;

    return value === upperLimit;
  }

  isAboveUpperLimit(value: number) {
    const { upperLimit } = this.props;

    return value > upperLimit;
  }

  isValueWithinLowerWarning(value: number) {
    const { lowerWarning } = this.props;

    if (lowerWarning === null) return false;

    return value <= lowerWarning && !this.isValueAtLowerLimit(value);
  }

  isValueAtLowerLimit(value: number) {
    const { lowerLimit } = this.props;

    return value === lowerLimit;
  }

  isBelowLowerLimit(value: number) {
    const { lowerLimit } = this.props;

    return value < lowerLimit;
  }

  private handleChange(evt: React.ChangeEvent<HTMLInputElement>) {
    const { onChange } = this.props;
    if (onChange !== undefined) onChange(evt.target.value);
  }

  private handleBlur() {
    const { onBlur } = this.props;
    if (onBlur !== undefined) onBlur();
  }

  render() {
    const { title, className, currentValue } = this.props;
    const currentValueNum = Number.parseInt(currentValue, 10);

    const inputClassName = clsx({
      [StatisticDisplay.UPPER_LIMIT_CLASS]: this.isValueAtUpperLimit(
        currentValueNum
      ),
      [StatisticDisplay.UPPER_WARNING_CLASS]: this.isValueWithinUpperWarning(
        currentValueNum
      ),
      [StatisticDisplay.LOWER_WARNING_CLASS]: this.isValueWithinLowerWarning(
        currentValueNum
      ),
      [StatisticDisplay.LOWER_LIMIT_CLASS]: this.isValueAtLowerLimit(
        currentValueNum
      ),
    });

    return (
      <label
        className={`StatisticDisplay StatisticDisplay__label input__label ${className}`}
      >
        {title}
        <input
          type="number"
          className={`StatisticDisplay__input input ${inputClassName}`}
          value={currentValue}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
        />
      </label>
    );
  }
}
