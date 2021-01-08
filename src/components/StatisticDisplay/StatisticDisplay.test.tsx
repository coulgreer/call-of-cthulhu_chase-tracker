import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import StatisticDisplay from "./StatisticDisplay";

test("renders statistics", () => {
  const title = "A Title";
  const startingValue = 5;

  render(<StatisticDisplay title={title} startingValue={startingValue} />);

  expect(screen.getByText(title)).toBeInTheDocument();

  const statisticValue = screen.getByLabelText(title).textContent;
  expect(statisticValue).toBe(startingValue.toString());
});

describe("Threshold class names", () => {
  test("should render statistics without any additional className when thresholds are not provided", () => {
    const title = "A Title";
    const startingValue = 0;

    render(<StatisticDisplay title={title} startingValue={startingValue} />);

    expect(screen.getByText(title)).toBeInTheDocument();

    const valueEl = screen.getByLabelText(title);
    const statisticValue = valueEl.textContent;
    expect(statisticValue).toBe(startingValue.toString());

    expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
    expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
    expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
    expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
  });

  describe("Lower Warning threshold", () => {
    test("should render statistics with an additional className when value is inside threshold", () => {
      const title = "A Title";
      const startingValue = -8;
      const lowerWarning = -7;
      const lowerLimit = -19;

      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          lowerWarning={lowerWarning}
          lowerLimit={lowerLimit}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();

      const valueEl = screen.getByLabelText(title);
      const statisticValue = valueEl.textContent;
      expect(statisticValue).toBe(startingValue.toString());

      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should render statistics with an additional className when value is at threshold", () => {
      const title = "A Title";
      const startingValue = -7;
      const lowerWarning = -7;
      const lowerLimit = -19;

      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          lowerWarning={lowerWarning}
          lowerLimit={lowerLimit}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();

      const valueEl = screen.getByLabelText(title);
      const statisticValue = valueEl.textContent;
      expect(statisticValue).toBe(startingValue.toString());

      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should render statistics with no additional className when value is outside threshold", () => {
      const title = "A Title";
      const startingValue = -6;
      const lowerWarning = -7;
      const lowerLimit = -19;

      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          lowerWarning={lowerWarning}
          lowerLimit={lowerLimit}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();

      const valueEl = screen.getByLabelText(title);
      const statisticValue = valueEl.textContent;
      expect(statisticValue).toBe(startingValue.toString());

      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });
  });

  describe("Lower Limit threshold", () => {
    test("should render statistics with an additional className when value is at threshold", () => {
      const title = "A Title";
      const startingValue = -19;
      const lowerWarning = -7;
      const lowerLimit = -19;

      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          lowerWarning={lowerWarning}
          lowerLimit={lowerLimit}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();

      const valueEl = screen.getByLabelText(title);
      const statisticValue = valueEl.textContent;
      expect(statisticValue).toBe(startingValue.toString());

      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should render statistics with no additional className when value is before threshold", () => {
      const title = "A Title";
      const startingValue = -18;
      const lowerLimit = -19;

      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          lowerLimit={lowerLimit}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();

      const valueEl = screen.getByLabelText(title);
      const statisticValue = valueEl.textContent;
      expect(statisticValue).toBe(startingValue.toString());

      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should throw error when value is outside threshold", () => {
      const originalError = console.error;
      console.error = jest.fn();

      const title = "A Title";
      const startingValue = -20;
      const lowerLimit = -19;

      expect(() => {
        render(
          <StatisticDisplay
            title={title}
            startingValue={startingValue}
            lowerLimit={lowerLimit}
          />
        );
      }).toThrowError();

      console.error = originalError;
    });
  });

  describe("Upper Warning threshold", () => {
    test("should render statistics with an additional className when value is inside threshold", () => {
      const title = "A Title";
      const startingValue = 8;
      const upperWarning = 7;
      const upperLimit = 19;

      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          upperWarning={upperWarning}
          upperLimit={upperLimit}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();

      const valueEl = screen.getByLabelText(title);
      const statisticValue = valueEl.textContent;
      expect(statisticValue).toBe(startingValue.toString());

      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should render statistics with an additional className when value is at threshold", () => {
      const title = "A Title";
      const startingValue = 7;
      const upperWarning = 7;
      const upperLimit = 19;

      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          upperWarning={upperWarning}
          upperLimit={upperLimit}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();

      const valueEl = screen.getByLabelText(title);
      const statisticValue = valueEl.textContent;
      expect(statisticValue).toBe(startingValue.toString());

      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should render statistics with an additional className when value is outside threshold", () => {
      const title = "A Title";
      const startingValue = 6;
      const upperWarning = 7;
      const upperLimit = 19;

      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          upperWarning={upperWarning}
          upperLimit={upperLimit}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();

      const valueEl = screen.getByLabelText(title);
      const statisticValue = valueEl.textContent;
      expect(statisticValue).toBe(startingValue.toString());

      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });
  });

  describe("Upper Limit threshold", () => {
    test("should render statistics with an additional className when value is at threshold", () => {
      const title = "A Title";
      const startingValue = 19;
      const upperLimit = 19;
      const upperWarning = 7;

      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          upperLimit={upperLimit}
          upperWarning={upperWarning}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();

      const valueEl = screen.getByLabelText(title);
      const statisticValue = valueEl.textContent;
      expect(statisticValue).toBe(startingValue.toString());

      expect(valueEl).toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });
  });
});
