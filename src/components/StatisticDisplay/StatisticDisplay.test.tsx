import React from "react";
import { render, screen } from "@testing-library/react";

import StatisticDisplay from ".";

test("should render statistics properly", () => {
  const className = "StatisticDisplay--vertical";
  const title = "A Title";
  const currentValue = "5";

  render(
    <StatisticDisplay
      className={className}
      title={title}
      currentValue={currentValue}
    />
  );

  expect(screen.getByText(title)).toHaveClass(className);

  const inputEl = screen.getByLabelText(title, { selector: "input" });
  expect(inputEl).toBeInTheDocument();
  expect(inputEl).toHaveValue(Number.parseInt(currentValue, 10));
});

describe("Threshold class names", () => {
  describe("when initially created", () => {
    test("should render statistics without any additional className when thresholds are not provided", () => {
      const title = "A Title";
      const currentValue = "0";

      render(<StatisticDisplay title={title} currentValue={currentValue} />);

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should throw error when upper warning and upper limit are equal", () => {
      const title = "A Title";
      const currentValue = "0";
      const threshold = 7;

      expect(() => {
        render(
          <StatisticDisplay
            title={title}
            currentValue={currentValue}
            upperWarning={threshold}
            upperLimit={threshold}
          />
        );
      }).toThrow();
    });

    test("should throw error when upper warning threshold is greater than upper limit threshold", () => {
      const title = "A Title";
      const currentValue = "0";
      const upperWarning = 7;
      const upperLimit = upperWarning - 1;

      expect(() => {
        render(
          <StatisticDisplay
            title={title}
            currentValue={currentValue}
            upperWarning={upperWarning}
            upperLimit={upperLimit}
          />
        );
      }).toThrow();
    });

    test("should throw error when lower warning and lower limit are equal", () => {
      const title = "A Title";
      const currentValue = "0";
      const threshold = -7;

      expect(() => {
        render(
          <StatisticDisplay
            title={title}
            currentValue={currentValue}
            lowerWarning={threshold}
            lowerLimit={threshold}
          />
        );
      }).toThrow();
    });

    test("should throw error when lower warning threshold is less than lower limit threshold", () => {
      const title = "A Title";
      const currentValue = "0";
      const lowerWarning = -7;
      const lowerLimit = lowerWarning + 1;

      expect(() => {
        render(
          <StatisticDisplay
            title={title}
            currentValue={currentValue}
            lowerWarning={lowerWarning}
            lowerLimit={lowerLimit}
          />
        );
      }).toThrow();
    });

    test("should throw error when lower bound and upper bound intercept", () => {
      const title = "A Title";
      const upperLimit = 7;
      const upperWarning = 3;
      const lowerWarning = 5;
      const lowerLimit = 2;
      const currentValue = (upperLimit - lowerLimit).toString();

      expect(() => {
        render(
          <StatisticDisplay
            title={title}
            currentValue={currentValue}
            upperLimit={upperLimit}
            upperWarning={upperWarning}
            lowerWarning={lowerWarning}
            lowerLimit={lowerLimit}
          />
        );
      }).toThrow();
    });

    describe("Lower Warning threshold", () => {
      test("should render statistics with an additional className when value is inside threshold", () => {
        const title = "A Title";
        const lowerWarning = -7;
        const currentValue = (lowerWarning - 1).toString();

        render(
          <StatisticDisplay
            title={title}
            currentValue={currentValue}
            lowerWarning={lowerWarning}
          />
        );

        const valueEl = screen.getByLabelText(title);
        expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
        expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
        expect(valueEl).toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
        expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
      });

      test("should render statistics with an additional className when value is at threshold", () => {
        const title = "A Title";
        const lowerWarning = -7;
        const currentValue = lowerWarning.toString();

        render(
          <StatisticDisplay
            title={title}
            currentValue={currentValue}
            lowerWarning={lowerWarning}
          />
        );

        const valueEl = screen.getByLabelText(title);
        expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
        expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
        expect(valueEl).toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
        expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
      });

      test("should render statistics with no additional className when value is outside threshold", () => {
        const title = "A Title";
        const lowerWarning = -7;
        const currentValue = (lowerWarning + 1).toString();

        render(
          <StatisticDisplay
            title={title}
            currentValue={currentValue}
            lowerWarning={lowerWarning}
          />
        );

        const valueEl = screen.getByLabelText(title);
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
        const currentValue = lowerLimit.toString();

        render(
          <StatisticDisplay
            title={title}
            currentValue={currentValue}
            lowerLimit={lowerLimit}
          />
        );

        const valueEl = screen.getByLabelText(title);
        expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
        expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
        expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
        expect(valueEl).toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
      });

      test("should render statistics with no additional className when value is before threshold", () => {
        const title = "A Title";
        const lowerLimit = -19;
        const currentValue = (lowerLimit + 1).toString();

        render(
          <StatisticDisplay
            title={title}
            currentValue={currentValue}
            lowerLimit={lowerLimit}
          />
        );

        const valueEl = screen.getByLabelText(title);
        expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
        expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
        expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
        expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
      });

      test("should throw error when value is below lower limit threshold", () => {
        const title = "A Title";
        const lowerLimit = -19;
        const currentValue = (lowerLimit - 1).toString();

        expect(() => {
          render(
            <StatisticDisplay
              title={title}
              currentValue={currentValue}
              lowerLimit={lowerLimit}
            />
          );
        }).toThrow();
      });
    });

    describe("Upper Warning threshold", () => {
      test("should render statistics with an additional className when value is inside threshold", () => {
        const title = "A Title";
        const upperWarning = 7;
        const currentValue = (upperWarning + 1).toString();

        render(
          <StatisticDisplay
            title={title}
            currentValue={currentValue}
            upperWarning={upperWarning}
          />
        );

        const valueEl = screen.getByLabelText(title);
        expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
        expect(valueEl).toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
        expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
        expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
      });

      test("should render statistics with an additional className when value is at threshold", () => {
        const title = "A Title";
        const upperWarning = 7;
        const currentValue = upperWarning.toString();

        render(
          <StatisticDisplay
            title={title}
            currentValue={currentValue}
            upperWarning={upperWarning}
          />
        );

        const valueEl = screen.getByLabelText(title);
        expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
        expect(valueEl).toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
        expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
        expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
      });

      test("should render statistics with an additional className when value is outside threshold", () => {
        const title = "A Title";
        const upperWarning = 7;
        const currentValue = (upperWarning - 1).toString();

        render(
          <StatisticDisplay
            title={title}
            currentValue={currentValue}
            upperWarning={upperWarning}
          />
        );

        const valueEl = screen.getByLabelText(title);
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
        const currentValue = upperLimit.toString();

        render(
          <StatisticDisplay
            title={title}
            currentValue={currentValue}
            upperLimit={upperLimit}
          />
        );

        const valueEl = screen.getByLabelText(title);
        expect(valueEl).toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
        expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
        expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
        expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
      });

      test("should render statistics with no additional className when value is before threshold", () => {
        const title = "A Title";
        const upperLimit = 19;
        const currentValue = (upperLimit - 1).toString();

        render(
          <StatisticDisplay
            title={title}
            currentValue={currentValue}
            upperLimit={upperLimit}
          />
        );

        const valueEl = screen.getByLabelText(title);
        expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
        expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
        expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
        expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
      });

      test("should throw error when value is above upper limit threshold", () => {
        const title = "A Title";
        const upperLimit = 19;
        const currentValue = (upperLimit + 1).toString();

        expect(() => {
          render(
            <StatisticDisplay
              title={title}
              currentValue={currentValue}
              upperLimit={upperLimit}
            />
          );
        }).toThrow();
      });
    });
  });
});
