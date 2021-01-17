import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import StatisticDisplay from "./StatisticDisplay";

test("should render statistics properly", () => {
  const title = "A Title";
  const startingValue = 5;

  render(<StatisticDisplay title={title} startingValue={startingValue} />);

  expect(screen.getByText(title)).toBeInTheDocument();

  const inputEl = screen.getByLabelText(title, { selector: "input" });
  expect(inputEl).toBeInTheDocument();
  expect(inputEl).toHaveValue(startingValue);
});

describe("Threshold class names", () => {
  describe("when initially created", () => {
    test("should render statistics without any additional className when thresholds are not provided", () => {
      const title = "A Title";
      const startingValue = 0;

      render(<StatisticDisplay title={title} startingValue={startingValue} />);

      const valueEl = screen.getByLabelText(title);
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

    test("should throw error when lower bound and upper bound intercept", () => {
      const title = "A Title";
      const upperLimit = 7;
      const upperWarning = 3;
      const lowerWarning = 5;
      const lowerLimit = 2;
      const startingValue = upperLimit - lowerLimit;

      const consoleError = disableConsoleErrors();
      expect(() => {
        render(
          <StatisticDisplay
            title={title}
            startingValue={startingValue}
            upperLimit={upperLimit}
            upperWarning={upperWarning}
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

        const valueEl = screen.getByLabelText(title);
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

        const valueEl = screen.getByLabelText(title);
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
        const startingValue = lowerLimit;

        render(
          <StatisticDisplay
            title={title}
            startingValue={startingValue}
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
        const startingValue = lowerLimit + 1;

        render(
          <StatisticDisplay
            title={title}
            startingValue={startingValue}
            lowerLimit={lowerLimit}
          />
        );

        const valueEl = screen.getByLabelText(title);
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

        const valueEl = screen.getByLabelText(title);
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

        const valueEl = screen.getByLabelText(title);
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
        const startingValue = upperLimit;

        render(
          <StatisticDisplay
            title={title}
            startingValue={startingValue}
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
        const startingValue = upperLimit - 1;

        render(
          <StatisticDisplay
            title={title}
            startingValue={startingValue}
            upperLimit={upperLimit}
          />
        );

        const valueEl = screen.getByLabelText(title);
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

  describe("when value updated", () => {
    test("should change class when decreasing value pass lower warning threshold", () => {
      const title = "TEST TITLE";
      const startingValue = 0;
      const lowerWarning = -3;
      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          lowerWarning={lowerWarning}
        />
      );

      const inputEl = screen.getByLabelText(title);
      userEvent.clear(inputEl);
      userEvent.type(inputEl, "-5");

      expect(inputEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(inputEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(inputEl).toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(inputEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should change class when increasing value pass upper warning threshold", () => {
      const title = "TEST TITLE";
      const startingValue = 0;
      const upperWarning = 3;
      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          upperWarning={upperWarning}
        />
      );

      const inputEl = screen.getByLabelText(title);
      userEvent.clear(inputEl);
      userEvent.type(inputEl, "5");

      expect(inputEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(inputEl).toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(inputEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(inputEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should change class when decreasing value to lower limit threshold", () => {
      const title = "TEST TITLE";
      const startingValue = 0;
      const lowerLimit = -3;
      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          lowerLimit={lowerLimit}
        />
      );

      const inputEl = screen.getByLabelText(title);
      userEvent.clear(inputEl);
      userEvent.type(inputEl, "-3");

      expect(inputEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(inputEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(inputEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(inputEl).toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should change class when increasing value to upper limit threshold", () => {
      const title = "TEST TITLE";
      const startingValue = 0;
      const upperLimit = 3;
      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          upperLimit={upperLimit}
        />
      );

      const inputEl = screen.getByLabelText(title);
      userEvent.clear(inputEl);
      userEvent.type(inputEl, "3");

      expect(inputEl).toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(inputEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(inputEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(inputEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should reset value to limit when value entered pass limit threshold", () => {
      const title = "TEST TITLE";
      const startingValue = 3;
      const upperLimit = 5;
      render(
        <StatisticDisplay
          title={title}
          startingValue={startingValue}
          upperLimit={upperLimit}
        />
      );

      const inputEl = screen.getByLabelText(title);
      userEvent.clear(inputEl);
      userEvent.type(inputEl, "7");
      inputEl.blur();

      expect(inputEl).toHaveValue(upperLimit);
    });
  });
});

describe("User input validation", () => {
  test("should update value when additional numbers are added", () => {
    const title = "TEST TITLE";
    const startingValue = 2;
    render(<StatisticDisplay title={title} startingValue={startingValue} />);

    const inputEl = screen.getByLabelText(title);
    userEvent.type(inputEl, "3");

    expect(inputEl).toHaveValue(23);
  });

  test("should return to prior valid value when input cleared and focus lost", () => {
    const title = "TEST TITLE";
    const startingValue = 3;
    render(<StatisticDisplay title={title} startingValue={startingValue} />);

    const inputEl = screen.getByLabelText(title);
    userEvent.type(inputEl, "5");
    userEvent.clear(inputEl);
    inputEl.blur();

    expect(inputEl).toHaveValue(35);
  });
});
