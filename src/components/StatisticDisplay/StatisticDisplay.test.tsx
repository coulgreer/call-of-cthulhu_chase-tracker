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

test("renders statistics with an additional className when value is within lower warning threshold", () => {
  const title = "A Title";
  const startingValue = 6;
  const lowerWarning = 6;
  const lowerLimit = 5;

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

  expect(valueEl).toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
  expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
});

test("renders statistics without any additional className when thresholds are not provided", () => {
  const title = "A Title";
  const startingValue = -6;

  render(<StatisticDisplay title={title} startingValue={startingValue} />);

  expect(screen.getByText(title)).toBeInTheDocument();

  const valueEl = screen.getByLabelText(title);
  const statisticValue = valueEl.textContent;
  expect(statisticValue).toBe(startingValue.toString());

  expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
  expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
});

test("renders statistics with an additional className when value is at lower limit threshold", () => {
  const title = "A Title";
  const startingValue = 6;
  const lowerLimit = 6;

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

  expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
  expect(valueEl).toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
});
