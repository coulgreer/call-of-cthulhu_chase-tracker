import React from "react";
import clsx from "clsx";

import Range from "../../utils/range";

import "./StatisticDisplay.css";
import { Statistic } from "../../types";

export interface WrappedStatistic {
  statistic: Statistic;
  currentValue: string;
  limiter?: Limiter;
  key?: number;
}

export interface Limiter {
  upperLimit: number;
  upperWarning?: number;
  lowerWarning?: number;
  lowerLimit: number;
}

interface Props {
  className: string;
  textboxClassName?: string;
  title: string;
  currentValue: string;
  limiter: Limiter;
  onStatisticChange?: (value: string) => void;
  onStatisticBlur?: () => void;
}

// TODO (Coul Greer): Refector this class to better represent the new understanding of components.
export default class StatisticDisplay extends React.Component<Props> {
  static defaultProps = {
    className: "",
    limiter: {
      upperLimit: Number.MAX_SAFE_INTEGER,
      upperWarning: Number.MAX_SAFE_INTEGER - 1,
      lowerWarning: Number.MIN_SAFE_INTEGER + 1,
      lowerLimit: Number.MIN_SAFE_INTEGER,
    },
  };

  static get DARK_MODE_CLASS() {
    return "textbox--on-dark";
  }

  static get LIGHT_MODE_CLASS() {
    return "textbox--on-light";
  }

  static get UPPER_LIMIT_CLASS() {
    return "textbox--upper-limit";
  }

  static get UPPER_WARNING_CLASS() {
    return "textbox--upper-warning";
  }

  static get LOWER_WARNING_CLASS() {
    return "textbox--lower-warning";
  }

  static get LOWER_LIMIT_CLASS() {
    return "textbox--lower-limit";
  }

  constructor(props: Props) {
    super(props);

    const { currentValue, limiter } = this.props;

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
        `The value, ${currentValue}, is outside the defined bounds of ${limiter.upperLimit} and ${limiter.lowerLimit}`
      );
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { onStatisticChange } = this.props;
    const { value } = event.currentTarget;

    if (onStatisticChange) onStatisticChange(value);
  }

  private handleBlur() {
    const { onStatisticBlur } = this.props;

    if (onStatisticBlur) onStatisticBlur();
  }

  private generateUpperBound(): Range {
    const { limiter } = this.props;

    if (limiter.upperWarning !== undefined) {
      if (limiter.upperWarning > limiter.upperLimit) {
        throw new RangeError(
          `The given upper warning, '${limiter.upperWarning}', is greater than the given upper limit, '${limiter.upperLimit}'.`
        );
      } else if (limiter.upperWarning === limiter.upperLimit) {
        throw new RangeError(
          `The given upper warning, '${limiter.upperWarning}', is equal to the given upper limit, '${limiter.upperLimit}'. The limit should be greater than the warning threshold.`
        );
      }
    }

    const end = limiter.upperLimit;
    const start = limiter.upperWarning ?? end;

    return new Range(start, end);
  }

  private generateLowerBound(): Range {
    const { limiter } = this.props;

    if (limiter.lowerWarning !== undefined) {
      if (limiter.lowerWarning < limiter.lowerLimit) {
        throw new RangeError(
          `The given lower warning, '${limiter.lowerWarning}', is less than the given lower limit, '${limiter.lowerLimit}'.`
        );
      } else if (limiter.lowerLimit === limiter.lowerWarning) {
        throw new RangeError(
          `The given lower warning, '${limiter.lowerWarning}', is equal to the given lower limit, '${limiter.lowerLimit}'. The limit should be less than the warning threshold.`
        );
      }
    }

    const end = limiter.lowerLimit;
    const start = limiter.lowerWarning ?? end;

    return new Range(start, end);
  }

  isValueWithinUpperWarning(value: number) {
    const { limiter } = this.props;

    if (limiter.upperWarning === undefined) return false;

    return value >= limiter.upperWarning && !this.isValueAtUpperLimit(value);
  }

  isValueAtUpperLimit(value: number) {
    const { limiter } = this.props;

    return value === limiter.upperLimit;
  }

  isAboveUpperLimit(value: number) {
    const { limiter } = this.props;

    return value > limiter.upperLimit;
  }

  isValueWithinLowerWarning(value: number) {
    const { limiter } = this.props;

    if (limiter.lowerWarning === undefined) return false;

    return value <= limiter.lowerWarning && !this.isValueAtLowerLimit(value);
  }

  isValueAtLowerLimit(value: number) {
    const { limiter } = this.props;

    return value === limiter.lowerLimit;
  }

  isBelowLowerLimit(value: number) {
    const { limiter } = this.props;

    return value < limiter.lowerLimit;
  }

  render() {
    const { title, className, textboxClassName, currentValue } = this.props;
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
      <label className={`StatisticDisplay ${className}`}>
        <span className="input__label">{title}</span>
        <input
          type="number"
          className={`textbox textbox--centered ${inputClassName} ${
            textboxClassName || StatisticDisplay.DARK_MODE_CLASS
          }`}
          value={currentValue}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
        />
      </label>
    );
  }
}
