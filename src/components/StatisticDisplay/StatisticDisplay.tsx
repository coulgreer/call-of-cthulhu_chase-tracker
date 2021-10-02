import * as React from "react";

import NumberFormat from "react-number-format";
import { TextField } from "@mui/material";

import classnames from "classnames";
import { nanoid } from "nanoid";

import Range from "../../utils/range";

import "./StatisticDisplay.css";
import { Statistic } from "../../types";

export interface WrappedStatistic {
  id?: string;
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
  title: string;
  currentValue: string;
  limiter: Limiter;
  color?: "primary" | "secondary";
  onStatisticClick?: (event: React.SyntheticEvent) => void;
  onStatisticChange?: (value: string) => void;
  onStatisticBlur?: () => void;
}

interface State {
  modifier: number;
}

const neutralModifier = 0;

export default class StatisticDisplay extends React.Component<Props, State> {
  static defaultProps = {
    className: "",
    limiter: {
      upperLimit: Number.MAX_SAFE_INTEGER,
      upperWarning: Number.MAX_SAFE_INTEGER - 1,
      lowerWarning: Number.MIN_SAFE_INTEGER + 1,
      lowerLimit: Number.MIN_SAFE_INTEGER,
    },
  };

  private id;

  constructor(props: Props) {
    super(props);

    this.state = { modifier: neutralModifier };

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

    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);

    this.id = nanoid();
  }

  private handleClick(event: React.SyntheticEvent) {
    const { onStatisticClick } = this.props;

    if (onStatisticClick) onStatisticClick(event);
  }

  private handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp") {
      this.setState(({ modifier }) => ({ modifier: modifier + 1 }));
    } else if (event.key === "ArrowDown") {
      this.setState(({ modifier }) => ({ modifier: modifier - 1 }));
    }
  }

  private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { onStatisticChange } = this.props;
    const { value } = event.currentTarget;

    this.setState({ modifier: neutralModifier });

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
    const { title, currentValue, color = "primary" } = this.props;
    const { modifier } = this.state;
    const inputId = `statistic-display-${this.id}`;
    const currentValueNum = Number.parseInt(currentValue, 10);
    const totalValue = currentValueNum + modifier;

    const inputClasses = classnames({
      "StatisticDisplay--upper-limit": this.isValueAtUpperLimit(totalValue),
      "StatisticDisplay--upper-warning":
        this.isValueWithinUpperWarning(totalValue),
      "StatisticDisplay--lower-warning":
        this.isValueWithinLowerWarning(totalValue),
      "StatisticDisplay--lower-limit": this.isValueAtLowerLimit(totalValue),
    });

    // TODO (Coul Greer): Add keyboard support for ArrowDown and ArrowUp
    return (
      <NumberFormat
        customInput={TextField}
        id={inputId}
        label={title}
        variant="outlined"
        color={color}
        value={totalValue.toString()}
        onClick={this.handleClick}
        onKeyDown={this.handleKeyDown}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
        InputProps={{
          inputProps: {
            className: inputClasses,
            role: "spinbutton",
            inputMode: "decimal",
          },
        }}
      />
    );
  }
}
