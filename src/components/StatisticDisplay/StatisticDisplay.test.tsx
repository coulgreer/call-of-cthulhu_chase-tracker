import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import StatisticDisplay from ".";

const DEFAULT_PROPS = {
  className: "",
  title: "TEST_TITLE",
  currentValue: "5",
  upperLimit: 11,
  lowerLimit: -11,
  onStatisticChange: jest.fn(),
  onStatisticBlur: jest.fn(),
};

test("should render statistics properly", () => {
  const className = "StatisticDisplay--vertical";

  render(
    <StatisticDisplay
      className={className}
      title={DEFAULT_PROPS.title}
      currentValue={DEFAULT_PROPS.currentValue}
    />
  );

  expect(screen.getByText(DEFAULT_PROPS.title)).toHaveClass(className);

  const inputEl = screen.getByLabelText(DEFAULT_PROPS.title, {
    selector: "input",
  });
  expect(inputEl).toBeInTheDocument();
  expect(inputEl).toHaveDisplayValue(DEFAULT_PROPS.currentValue);
  expect(inputEl).toHaveClass(StatisticDisplay.DARK_MODE_CLASS);
});

test("should render statistics properly when textbox class is provided", () => {
  const className = "StatisticDisplay--vertical";

  render(
    <StatisticDisplay
      className={className}
      textboxClassName={StatisticDisplay.LIGHT_MODE_CLASS}
      title={DEFAULT_PROPS.title}
      currentValue={DEFAULT_PROPS.currentValue}
    />
  );

  expect(screen.getByText(DEFAULT_PROPS.title)).toHaveClass(className);

  const inputEl = screen.getByLabelText(DEFAULT_PROPS.title, {
    selector: "input",
  });
  expect(inputEl).toBeInTheDocument();
  expect(inputEl).toHaveDisplayValue(DEFAULT_PROPS.currentValue);
  expect(inputEl).toHaveClass(StatisticDisplay.LIGHT_MODE_CLASS);
});

test("should call onChange handler when anything is changed in input", () => {
  render(
    <StatisticDisplay
      title={DEFAULT_PROPS.title}
      currentValue={DEFAULT_PROPS.currentValue}
      onStatisticChange={DEFAULT_PROPS.onStatisticChange}
    />
  );

  userEvent.type(screen.getByLabelText(DEFAULT_PROPS.title), "a");

  expect(DEFAULT_PROPS.onStatisticChange).toBeCalled();
});

test("should call onBlur handler when input is deselected", () => {
  render(
    <StatisticDisplay
      title={DEFAULT_PROPS.title}
      currentValue={DEFAULT_PROPS.currentValue}
      onStatisticBlur={DEFAULT_PROPS.onStatisticBlur}
    />
  );

  const inputEl = screen.getByLabelText(DEFAULT_PROPS.title);
  userEvent.click(inputEl);
  inputEl.blur();

  expect(DEFAULT_PROPS.onStatisticBlur).toBeCalled();
});

describe("Threshold class names", () => {
  const currentValueNum = Number.parseInt(DEFAULT_PROPS.currentValue, 10);

  test("should render display without any additional classNames when thresholds are not provided and currentValue does not equal MAX_SAFE_INTEGER or MIN_SAFE_INTEGER", () => {
    const limiter = {
      upperLimit: currentValueNum + 2,
      upperWarning: currentValueNum + 1,
      lowerWarning: currentValueNum - 1,
      lowerLimit: currentValueNum - 2,
    };

    render(
      <StatisticDisplay
        title={DEFAULT_PROPS.title}
        currentValue={DEFAULT_PROPS.currentValue}
        limiter={limiter}
      />
    );

    const valueEl = screen.getByLabelText(DEFAULT_PROPS.title);
    expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
    expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
    expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
    expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
  });

  test("should throw error when upper warning and upper limit are equal", () => {
    const threshold = currentValueNum + 1;
    const limiter = {
      lowerLimit: DEFAULT_PROPS.lowerLimit,
      upperWarning: threshold,
      upperLimit: threshold,
    };

    expect(() => {
      render(
        <StatisticDisplay
          title={DEFAULT_PROPS.title}
          currentValue={DEFAULT_PROPS.currentValue}
          limiter={limiter}
        />
      );
    }).toThrow();
  });

  test("should throw error when upper warning threshold is greater than upper limit threshold", () => {
    const upperWarning = currentValueNum + 2;
    const upperLimit = upperWarning - 1;
    const limiter = {
      lowerLimit: DEFAULT_PROPS.lowerLimit,
      upperWarning,
      upperLimit,
    };

    expect(() => {
      render(
        <StatisticDisplay
          title={DEFAULT_PROPS.title}
          currentValue={DEFAULT_PROPS.currentValue}
          limiter={limiter}
        />
      );
    }).toThrow();
  });

  test("should throw error when lower warning and lower limit are equal", () => {
    const threshold = currentValueNum - 1;
    const limiter = {
      lowerLimit: threshold,
      lowerWarning: threshold,
      upperLimit: DEFAULT_PROPS.upperLimit,
    };

    expect(() => {
      render(
        <StatisticDisplay
          title={DEFAULT_PROPS.title}
          currentValue={DEFAULT_PROPS.currentValue}
          limiter={limiter}
        />
      );
    }).toThrow();
  });

  test("should throw error when lower warning threshold is less than lower limit threshold", () => {
    const lowerWarning = currentValueNum - 2;
    const lowerLimit = lowerWarning + 1;
    const limiter = {
      upperLimit: DEFAULT_PROPS.upperLimit,
      lowerWarning,
      lowerLimit,
    };

    expect(() => {
      render(
        <StatisticDisplay
          title={DEFAULT_PROPS.title}
          currentValue={DEFAULT_PROPS.currentValue}
          limiter={limiter}
        />
      );
    }).toThrow();
  });

  test("should throw error when lower bound and upper bound intercept", () => {
    const limiter = {
      upperLimit: 7,
      upperWarning: 3,
      lowerWarning: 5,
      lowerLimit: 2,
    };

    expect(() => {
      render(
        <StatisticDisplay
          title={DEFAULT_PROPS.title}
          currentValue={DEFAULT_PROPS.currentValue}
          limiter={limiter}
        />
      );
    }).toThrow();
  });

  describe("Lower Warning threshold", () => {
    const lowerWarning = -7;
    const lowerLimit = lowerWarning - 2;
    const upperLimit = lowerWarning + 3;
    const limiter = { lowerLimit, lowerWarning, upperLimit };

    test("should render statistics with an additional className when value is inside threshold", () => {
      const currentValue = (lowerWarning - 1).toString();

      render(
        <StatisticDisplay
          title={DEFAULT_PROPS.title}
          currentValue={currentValue}
          limiter={limiter}
        />
      );

      const valueEl = screen.getByLabelText(DEFAULT_PROPS.title);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should render statistics with an additional className when value is at threshold", () => {
      const currentValue = lowerWarning.toString();

      render(
        <StatisticDisplay
          title={DEFAULT_PROPS.title}
          currentValue={currentValue}
          limiter={limiter}
        />
      );

      const valueEl = screen.getByLabelText(DEFAULT_PROPS.title);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should render statistics with no additional className when value is outside threshold", () => {
      const currentValue = (lowerWarning + 1).toString();

      render(
        <StatisticDisplay
          title={DEFAULT_PROPS.title}
          currentValue={currentValue}
          limiter={limiter}
        />
      );

      const valueEl = screen.getByLabelText(DEFAULT_PROPS.title);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });
  });

  describe("Lower Limit threshold", () => {
    const lowerLimit = -19;
    const upperLimit = lowerLimit + 4;
    const limiter = { upperLimit, lowerLimit };

    test("should render statistics with an additional className when value is at threshold", () => {
      const currentValue = lowerLimit.toString();

      render(
        <StatisticDisplay
          title={DEFAULT_PROPS.title}
          currentValue={currentValue}
          limiter={limiter}
        />
      );

      const valueEl = screen.getByLabelText(DEFAULT_PROPS.title);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should render statistics with no additional className when value is before threshold", () => {
      const currentValue = (lowerLimit + 1).toString();

      render(
        <StatisticDisplay
          title={DEFAULT_PROPS.title}
          currentValue={currentValue}
          limiter={limiter}
        />
      );

      const valueEl = screen.getByLabelText(DEFAULT_PROPS.title);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should throw error when value is below lower limit threshold", () => {
      const currentValue = (lowerLimit - 1).toString();

      expect(() => {
        render(
          <StatisticDisplay
            title={DEFAULT_PROPS.title}
            currentValue={currentValue}
            limiter={limiter}
          />
        );
      }).toThrow();
    });
  });

  describe("Upper Warning threshold", () => {
    const upperWarning = 7;
    const upperLimit = upperWarning + 2;
    const lowerLimit = upperWarning - 2;
    const limiter = { upperLimit, upperWarning, lowerLimit };

    test("should render statistics with an additional className when value is inside threshold", () => {
      const currentValue = (upperWarning + 1).toString();

      render(
        <StatisticDisplay
          title={DEFAULT_PROPS.title}
          currentValue={currentValue}
          limiter={limiter}
        />
      );

      const valueEl = screen.getByLabelText(DEFAULT_PROPS.title);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should render statistics with an additional className when value is at threshold", () => {
      const currentValue = upperWarning.toString();

      render(
        <StatisticDisplay
          title={DEFAULT_PROPS.title}
          currentValue={currentValue}
          limiter={limiter}
        />
      );

      const valueEl = screen.getByLabelText(DEFAULT_PROPS.title);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should render statistics with an additional className when value is outside threshold", () => {
      const currentValue = (upperWarning - 1).toString();

      render(
        <StatisticDisplay
          title={DEFAULT_PROPS.title}
          currentValue={currentValue}
          limiter={limiter}
        />
      );

      const valueEl = screen.getByLabelText(DEFAULT_PROPS.title);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });
  });

  describe("Upper Limit threshold", () => {
    const upperLimit = 19;
    const lowerLimit = upperLimit - 4;
    const limiter = { upperLimit, lowerLimit };

    test("should render statistics with an additional className when value is at threshold", () => {
      const currentValue = upperLimit.toString();

      render(
        <StatisticDisplay
          title={DEFAULT_PROPS.title}
          currentValue={currentValue}
          limiter={limiter}
        />
      );

      const valueEl = screen.getByLabelText(DEFAULT_PROPS.title);
      expect(valueEl).toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should render statistics with no additional className when value is before threshold", () => {
      const currentValue = (upperLimit - 1).toString();

      render(
        <StatisticDisplay
          title={DEFAULT_PROPS.title}
          currentValue={currentValue}
          limiter={limiter}
        />
      );

      const valueEl = screen.getByLabelText(DEFAULT_PROPS.title);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_LIMIT_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.UPPER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_WARNING_CLASS);
      expect(valueEl).not.toHaveClass(StatisticDisplay.LOWER_LIMIT_CLASS);
    });

    test("should throw error when value is above upper limit threshold", () => {
      const currentValue = (upperLimit + 1).toString();

      expect(() => {
        render(
          <StatisticDisplay
            title={DEFAULT_PROPS.title}
            currentValue={currentValue}
            limiter={limiter}
          />
        );
      }).toThrow();
    });
  });
});
