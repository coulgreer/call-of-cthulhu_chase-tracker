import * as React from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import StatisticDisplay from ".";

function createLimiter(seed: number | string) {
  const valueNum = typeof seed === "string" ? Number.parseInt(seed, 10) : seed;

  return {
    upperLimit: valueNum + 2,
    upperWarning: valueNum + 1,
    lowerWarning: valueNum - 1,
    lowerLimit: valueNum - 2,
  };
}

const DEFAULT_PROPS = {
  className: "",
  title: "TEST_TITLE",
  currentValue: "5",
  upperLimit: 11,
  lowerLimit: -11,
  onStatisticClick: jest.fn(),
  onStatisticChange: jest.fn(),
  onStatisticBlur: jest.fn(),
};

test("should render properly", () => {
  const { title, currentValue } = DEFAULT_PROPS;

  render(<StatisticDisplay title={title} currentValue={currentValue} />);

  expect(screen.getByRole("spinbutton", { name: title })).toHaveDisplayValue(
    currentValue
  );
});

test("should trigger onClick", () => {
  const { title, currentValue, onStatisticClick } = DEFAULT_PROPS;

  render(
    <StatisticDisplay
      title={title}
      currentValue={currentValue}
      onStatisticClick={onStatisticClick}
    />
  );

  userEvent.click(screen.getByRole("spinbutton", { name: title }));

  expect(onStatisticClick).toBeCalledTimes(1);
});

test("should trigger onChange", () => {
  const { title, currentValue, onStatisticChange } = DEFAULT_PROPS;

  render(
    <StatisticDisplay
      title={title}
      currentValue={currentValue}
      onStatisticChange={onStatisticChange}
    />
  );

  userEvent.type(screen.getByRole("spinbutton", { name: title }), "3");

  expect(onStatisticChange).toBeCalledTimes(1);
});

test("should trigger onBlur", () => {
  const { title, currentValue, onStatisticBlur } = DEFAULT_PROPS;

  render(
    <StatisticDisplay
      title={title}
      currentValue={currentValue}
      onStatisticBlur={onStatisticBlur}
    />
  );

  const inputEl = screen.getByRole("spinbutton", { name: title });
  userEvent.click(inputEl);
  inputEl.blur();

  expect(onStatisticBlur).toBeCalledTimes(1);
});

describe("Threshold class names", () => {
  const upperLimitClasses = "StatisticDisplay--upper-limit";
  const upperWarningClasses = "StatisticDisplay--upper-warning";
  const lowerWarningClasses = "StatisticDisplay--lower-warning";
  const lowerLimitClasses = "StatisticDisplay--lower-limit";

  test("should render without any boundary classnames when current value is within limits", () => {
    const title = "Total F's per Minute";
    const currentValue = "999";
    const limiter = createLimiter(currentValue);

    render(
      <StatisticDisplay
        title={title}
        currentValue={currentValue}
        limiter={limiter}
      />
    );

    const valueEl = screen.getByRole("spinbutton", { name: title });
    expect(valueEl).not.toHaveClass(upperLimitClasses);
    expect(valueEl).not.toHaveClass(upperWarningClasses);
    expect(valueEl).not.toHaveClass(lowerWarningClasses);
    expect(valueEl).not.toHaveClass(lowerLimitClasses);
  });

  test("should throw error when upper warning and upper limit are equal", () => {
    const currentValue = "5675309";
    const threshold = Number.parseInt(currentValue, 10) + 1;
    const lowerLimit = threshold - 10;
    const limiter = {
      lowerLimit,
      upperWarning: threshold,
      upperLimit: threshold,
    };
    const spy = jest.spyOn(console, "error");

    spy.mockImplementation(() => {});

    expect(() => {
      render(
        <StatisticDisplay
          title="That One Song About That Phone Number"
          currentValue={currentValue}
          limiter={limiter}
        />
      );
    }).toThrow();

    spy.mockRestore();
  });

  test("should throw error when upper warning threshold is greater than upper limit threshold", () => {
    const currentValue = "2";
    const lowerLimit = Number.parseInt(currentValue, 10) - 10;
    const upperWarning = Number.parseInt(currentValue, 10) + 10;
    const upperLimit = upperWarning - 1;
    const limiter = {
      lowerLimit,
      upperWarning,
      upperLimit,
    };
    const spy = jest.spyOn(console, "error");

    spy.mockImplementation(() => {});

    expect(() => {
      render(
        <StatisticDisplay
          title="Clap Count"
          currentValue={currentValue}
          limiter={limiter}
        />
      );
    }).toThrow();

    spy.mockRestore();
  });

  test("should throw error when lower warning and lower limit are equal", () => {
    const currentValue = "2";
    const threshold = Number.parseInt(currentValue, 10) - 10;
    const upperLimit = threshold + 10;
    const limiter = {
      lowerLimit: threshold,
      lowerWarning: threshold,
      upperLimit,
    };
    const spy = jest.spyOn(console, "error");

    spy.mockImplementation(() => {});

    expect(() => {
      render(
        <StatisticDisplay
          title="Good Alien Movie Count"
          currentValue={currentValue}
          limiter={limiter}
        />
      );
    }).toThrow();

    spy.mockRestore();
  });

  test("should throw error when lower warning threshold is less than lower limit threshold", () => {
    const currentValue = "96";
    const upperLimit = Number.parseInt(currentValue, 10) + 10;
    const lowerWarning = Number.parseInt(currentValue, 10) - 2;
    const lowerLimit = lowerWarning + 10;
    const limiter = {
      upperLimit,
      lowerWarning,
      lowerLimit,
    };
    const spy = jest.spyOn(console, "error");

    spy.mockImplementation(() => {});

    expect(() => {
      render(
        <StatisticDisplay
          title="bpm"
          currentValue={currentValue}
          limiter={limiter}
        />
      );
    }).toThrow();

    spy.mockRestore();
  });

  test("should throw error when lower bound and upper bound intercept", () => {
    const currentValue = "1000000";
    const upperLimit = Number.parseInt(currentValue, 10) + 10;
    const upperWarning = Number.parseInt(currentValue, 10) - 5;
    const lowerWarning = Number.parseInt(currentValue, 10) + 5;
    const lowerLimit = Number.parseInt(currentValue, 10) - 10;
    const limiter = {
      upperLimit,
      upperWarning,
      lowerWarning,
      lowerLimit,
    };
    const spy = jest.spyOn(console, "error");

    spy.mockImplementation(() => {});

    expect(() => {
      render(
        <StatisticDisplay
          title="Times Confused by an Analogy"
          currentValue={currentValue}
          limiter={limiter}
        />
      );
    }).toThrow();

    spy.mockRestore();
  });

  describe("Lower Warning threshold", () => {
    const lowerWarning = -7;
    const lowerLimit = lowerWarning - 2;
    const upperLimit = lowerWarning + 3;
    const limiter = { lowerLimit, lowerWarning, upperLimit };

    test("should render statistics with appropriate boundary classname when value is inside threshold", () => {
      const title = "A Test Called Desire";
      const currentValue = (lowerWarning - 1).toString();

      render(
        <StatisticDisplay
          title={title}
          currentValue={currentValue}
          limiter={limiter}
        />
      );

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).not.toHaveClass(upperLimitClasses);
      expect(valueEl).not.toHaveClass(upperWarningClasses);
      expect(valueEl).toHaveClass(lowerWarningClasses);
      expect(valueEl).not.toHaveClass(lowerLimitClasses);
    });

    test("should render statistics with appropriate boundary classname when value is at threshold", () => {
      const title = "The Testfather";
      const currentValue = lowerWarning.toString();

      render(
        <StatisticDisplay
          title={title}
          currentValue={currentValue}
          limiter={limiter}
        />
      );

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).not.toHaveClass(upperLimitClasses);
      expect(valueEl).not.toHaveClass(upperWarningClasses);
      expect(valueEl).toHaveClass(lowerWarningClasses);
      expect(valueEl).not.toHaveClass(lowerLimitClasses);
    });

    test("should render statistics without boundary classname when value is outside threshold", () => {
      const title = "On the Testfront";
      const currentValue = (lowerWarning + 1).toString();

      render(
        <StatisticDisplay
          title={title}
          currentValue={currentValue}
          limiter={limiter}
        />
      );

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).not.toHaveClass(upperLimitClasses);
      expect(valueEl).not.toHaveClass(upperWarningClasses);
      expect(valueEl).not.toHaveClass(lowerWarningClasses);
      expect(valueEl).not.toHaveClass(lowerLimitClasses);
    });
  });

  describe("Lower Limit threshold", () => {
    const lowerLimit = -19;
    const upperLimit = lowerLimit + 4;
    const limiter = { upperLimit, lowerLimit };

    test("should render statistics with appropriate boundary classname when value is at threshold", () => {
      const title = "Apoca-test Now";
      const currentValue = lowerLimit.toString();

      render(
        <StatisticDisplay
          title={title}
          currentValue={currentValue}
          limiter={limiter}
        />
      );

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).not.toHaveClass(upperLimitClasses);
      expect(valueEl).not.toHaveClass(upperWarningClasses);
      expect(valueEl).not.toHaveClass(lowerWarningClasses);
      expect(valueEl).toHaveClass(lowerLimitClasses);
    });

    test("should render statistics without boundary classname when value is before threshold", () => {
      const title = "Now You Test";
      const currentValue = (lowerLimit + 1).toString();

      render(
        <StatisticDisplay
          title={title}
          currentValue={currentValue}
          limiter={limiter}
        />
      );

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).not.toHaveClass(upperLimitClasses);
      expect(valueEl).not.toHaveClass(upperWarningClasses);
      expect(valueEl).not.toHaveClass(lowerWarningClasses);
      expect(valueEl).not.toHaveClass(lowerLimitClasses);
    });

    test("should throw error when value is below lower limit threshold", () => {
      const currentValue = (lowerLimit - 1).toString();
      const spy = jest.spyOn(console, "error");

      spy.mockImplementation(() => {});

      expect(() => {
        render(
          <StatisticDisplay
            title="How Many Titles Can I Test?"
            currentValue={currentValue}
            limiter={limiter}
          />
        );
      }).toThrow();

      spy.mockRestore();
    });
  });

  describe("Upper Warning threshold", () => {
    const upperWarning = 7;
    const upperLimit = upperWarning + 2;
    const lowerLimit = upperWarning - 2;
    const limiter = { upperLimit, upperWarning, lowerLimit };

    test("should render statistics with appropriate boundary classname when value is inside threshold", () => {
      const title = "A Value or Something";
      const currentValue = (upperWarning + 1).toString();

      render(
        <StatisticDisplay
          title={title}
          currentValue={currentValue}
          limiter={limiter}
        />
      );

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).not.toHaveClass(upperLimitClasses);
      expect(valueEl).toHaveClass(upperWarningClasses);
      expect(valueEl).not.toHaveClass(lowerWarningClasses);
      expect(valueEl).not.toHaveClass(lowerLimitClasses);
    });

    test("should render statistics with appropriate boundary classname when value is at threshold", () => {
      const title = "A Dog Day Testing";
      const currentValue = upperWarning.toString();

      render(
        <StatisticDisplay
          title={title}
          currentValue={currentValue}
          limiter={limiter}
        />
      );

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).not.toHaveClass(upperLimitClasses);
      expect(valueEl).toHaveClass(upperWarningClasses);
      expect(valueEl).not.toHaveClass(lowerWarningClasses);
      expect(valueEl).not.toHaveClass(lowerLimitClasses);
    });

    test("should render statistics with appropriate boundary classname when value is outside threshold", () => {
      const title = "For a Few Values More";
      const currentValue = (upperWarning - 1).toString();

      render(
        <StatisticDisplay
          title={title}
          currentValue={currentValue}
          limiter={limiter}
        />
      );

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).not.toHaveClass(upperLimitClasses);
      expect(valueEl).not.toHaveClass(upperWarningClasses);
      expect(valueEl).not.toHaveClass(lowerWarningClasses);
      expect(valueEl).not.toHaveClass(lowerLimitClasses);
    });
  });

  describe("Upper Limit threshold", () => {
    const upperLimit = 19;
    const lowerLimit = upperLimit - 4;
    const limiter = { upperLimit, lowerLimit };

    test("should render statistics with appropriate boundary classname when value is at threshold", () => {
      const title = "A Fistful of Tests";
      const currentValue = upperLimit.toString();

      render(
        <StatisticDisplay
          title={title}
          currentValue={currentValue}
          limiter={limiter}
        />
      );

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).toHaveClass(upperLimitClasses);
      expect(valueEl).not.toHaveClass(upperWarningClasses);
      expect(valueEl).not.toHaveClass(lowerWarningClasses);
      expect(valueEl).not.toHaveClass(lowerLimitClasses);
    });

    test("should render statistics without boundary classname when value is before threshold", () => {
      const title = "The Good, The Bad, and The Tested";
      const currentValue = (upperLimit - 1).toString();

      render(
        <StatisticDisplay
          title={title}
          currentValue={currentValue}
          limiter={limiter}
        />
      );

      const valueEl = screen.getByLabelText(title);
      expect(valueEl).not.toHaveClass(upperLimitClasses);
      expect(valueEl).not.toHaveClass(upperWarningClasses);
      expect(valueEl).not.toHaveClass(lowerWarningClasses);
      expect(valueEl).not.toHaveClass(lowerLimitClasses);
    });

    test("should throw error when value is above upper limit threshold", () => {
      const currentValue = (upperLimit + 1).toString();
      const spy = jest.spyOn(console, "error");

      spy.mockImplementation(() => {});

      expect(() => {
        render(
          <StatisticDisplay
            title="The Last of the Test-hicans"
            currentValue={currentValue}
            limiter={limiter}
          />
        );
      }).toThrow();

      spy.mockRestore();
    });
  });
});
