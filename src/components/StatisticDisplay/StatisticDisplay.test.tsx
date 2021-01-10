import React from "react";
import { render, screen } from "@testing-library/react";

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
    expect(valueEl).toHaveTextContent(startingValue.toString());

    expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
    expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
    expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
    expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
  });

  test("should throw error when upper warning and upper limit are equal", () => {
    const title = "A Title";
    const startingValue = 0;
    const threshold = 7;

    const consoleError = disableConsoleErrors();
    expect(() => {
      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          upperWarning={threshold}
          upperLimit={threshold}
        />
      );
    }).toThrowError();
    reenableConsoleErrors(consoleError);
  });

  test("should throw error when upper warning threshold is greater than upper limit threshold", () => {
    const title = "A Title";
    const startingValue = 0;
    const upperWarning = 7;
    const upperLimit = upperWarning - 1;

    const consoleError = disableConsoleErrors();
    expect(() => {
      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          upperWarning={upperWarning}
          upperLimit={upperLimit}
        />
      );
    }).toThrowError();
    reenableConsoleErrors(consoleError);
  });

  test("should throw error when lower warning and lower limit are equal", () => {
    const title = "A Title";
    const startingValue = 0;
    const threshold = -7;

    const consoleError = disableConsoleErrors();
    expect(() => {
      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          lowerWarning={threshold}
          lowerLimit={threshold}
        />
      );
    }).toThrowError();
    reenableConsoleErrors(consoleError);
  });

  test("should throw error when lower warning threshold is less than lower limit threshold", () => {
    const title = "A Title";
    const startingValue = 0;
    const lowerWarning = -7;
    const lowerLimit = lowerWarning + 1;

    const consoleError = disableConsoleErrors();
    expect(() => {
      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          lowerWarning={lowerWarning}
          lowerLimit={lowerLimit}
        />
      );
    }).toThrowError();
    reenableConsoleErrors(consoleError);
  });

  describe("Lower Warning threshold", () => {
    test("should render statistics with an additional className when value is inside threshold", () => {
      const title = "A Title";
      const lowerWarning = -7;
      const startingValue = lowerWarning - 1;

      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          lowerWarning={lowerWarning}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).toHaveTextContent(startingValue.toString());

      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should render statistics with an additional className when value is at threshold", () => {
      const title = "A Title";
      const lowerWarning = -7;
      const startingValue = lowerWarning;

      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          lowerWarning={lowerWarning}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).toHaveTextContent(startingValue.toString());

      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should render statistics with no additional className when value is outside threshold", () => {
      const title = "A Title";
      const lowerWarning = -7;
      const startingValue = lowerWarning + 1;

      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          lowerWarning={lowerWarning}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).toHaveTextContent(startingValue.toString());

      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });
  });

  describe("Lower Limit threshold", () => {
    test("should render statistics with an additional className when value is at threshold", () => {
      const title = "A Title";
      const lowerLimit = -19;
      const startingValue = lowerLimit;

      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          lowerLimit={lowerLimit}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).toHaveTextContent(startingValue.toString());

      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should render statistics with no additional className when value is before threshold", () => {
      const title = "A Title";
      const lowerLimit = -19;
      const startingValue = lowerLimit + 1;

      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          lowerLimit={lowerLimit}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).toHaveTextContent(startingValue.toString());

      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should throw error when value is outside threshold", () => {
      const title = "A Title";
      const lowerLimit = -19;
      const startingValue = lowerLimit - 1;

      const originalError = disableConsoleErrors();
      expect(() => {
        render(
          <StatisticDisplay
            title={title}
            startingValue={startingValue}
            lowerLimit={lowerLimit}
          />
        );
      }).toThrowError();
      reenableConsoleErrors(originalError);
    });
  });

  describe("Upper Warning threshold", () => {
    test("should render statistics with an additional className when value is inside threshold", () => {
      const title = "A Title";
      const upperWarning = 7;
      const startingValue = upperWarning + 1;

      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          upperWarning={upperWarning}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).toHaveTextContent(startingValue.toString());

      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should render statistics with an additional className when value is at threshold", () => {
      const title = "A Title";
      const upperWarning = 7;
      const startingValue = upperWarning;

      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          upperWarning={upperWarning}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).toHaveTextContent(startingValue.toString());

      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should render statistics with an additional className when value is outside threshold", () => {
      const title = "A Title";
      const upperWarning = 7;
      const startingValue = upperWarning - 1;

      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          upperWarning={upperWarning}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).toHaveTextContent(startingValue.toString());

      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });
  });

  describe("Upper Limit threshold", () => {
    test("should render statistics with an additional className when value is at threshold", () => {
      const title = "A Title";
      const upperLimit = 19;
      const startingValue = upperLimit;

      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          upperLimit={upperLimit}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).toHaveTextContent(startingValue.toString());

      expect(valueEl).toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should render statistics with no additional className when value is before threshold", () => {
      const title = "A Title";
      const upperLimit = 19;
      const startingValue = upperLimit - 1;

      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          upperLimit={upperLimit}
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).toHaveTextContent(startingValue.toString());

      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should throw error when value is outside threshold", () => {
      const title = "A Title";
      const upperLimit = 19;
      const startingValue = upperLimit + 1;

      const originalError = disableConsoleErrors();
      expect(() => {
        render(
          <StatisticDisplay
            title={title}
            startingValue={startingValue}
            upperLimit={upperLimit}
          />
        );
      }).toThrowError();
      reenableConsoleErrors(originalError);
    });
  });
});
