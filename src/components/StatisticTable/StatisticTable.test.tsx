import React from "react";

import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import StatisticTable from ".";

const DEFAULT_PROPS = {
  title: "TEST_TITLE",
  data: [
    { statistic: { name: "title1", score: 1 }, currentValue: "1", key: 1 },
    { statistic: { name: "title2", score: 2 }, currentValue: "2", key: 2 },
  ],
};

let origErrorConsole: (...data: any[]) => void;

beforeEach(() => {
  origErrorConsole = window.console.error;

  window.console.error = (...args) => {
    const firstArg = args.length > 0 && args[0];

    const shouldBeIgnored =
      firstArg &&
      typeof firstArg === "string" &&
      firstArg.includes("Not implemented: HTMLFormElement.prototype.submit");

    if (!shouldBeIgnored) {
      origErrorConsole(...args);
    }
  };
});

afterEach(() => {
  window.console.error = origErrorConsole;
});

test("should render main display properly", () => {
  const [first, second] = DEFAULT_PROPS.data;
  render(
    <StatisticTable title={DEFAULT_PROPS.title} data={DEFAULT_PROPS.data} />
  );

  expect(
    screen.getByRole("heading", { name: DEFAULT_PROPS.title })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /create statistic/i })
  ).toBeInTheDocument();

  expect(screen.getByLabelText(first.statistic.name)).toBeInTheDocument();
  expect(
    screen.getByRole("button", {
      name: new RegExp(`delete: ${first.statistic.name}`),
    })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", {
      name: new RegExp(`rename: ${first.statistic.name}`),
    })
  ).toBeInTheDocument();

  expect(screen.getByLabelText(second.statistic.name)).toBeInTheDocument();
  expect(
    screen.getByRole("button", {
      name: new RegExp(`delete: ${second.statistic.name}`),
    })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", {
      name: new RegExp(`rename: ${second.statistic.name}`),
    })
  ).toBeInTheDocument();
});

test("should properly render renaming modal", () => {
  const [first] = DEFAULT_PROPS.data;
  const {
    statistic: { name },
  } = first;

  render(
    <StatisticTable title={DEFAULT_PROPS.title} data={DEFAULT_PROPS.data} />
  );

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

  userEvent.click(
    screen.getByRole("button", {
      name: new RegExp(`rename: ${name}`),
    })
  );

  expect(screen.getByRole("dialog")).toBeVisible();
  expect(screen.getByRole("textbox", { name: /new name/i })).toBeVisible();
  expect(screen.getByRole("button", { name: /cancel/i })).toBeVisible();
  expect(screen.getByRole("button", { name: /^rename$/i })).toBeVisible();
});

test("should close modal when cancel button is pressed", () => {
  const [first] = DEFAULT_PROPS.data;
  render(
    <StatisticTable title={DEFAULT_PROPS.title} data={DEFAULT_PROPS.data} />
  );

  userEvent.click(
    screen.getByRole("button", {
      name: new RegExp(`rename: ${first.statistic.name}`),
    })
  );
  userEvent.click(screen.getByRole("button", { name: /cancel/i }));

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("should close modal when accept button is pressed", () => {
  const [first] = DEFAULT_PROPS.data;
  render(
    <StatisticTable title={DEFAULT_PROPS.title} data={DEFAULT_PROPS.data} />
  );

  userEvent.click(
    screen.getByRole("button", {
      name: new RegExp(`rename: ${first.statistic.name}`),
    })
  );
  userEvent.click(screen.getByRole("button", { name: /^rename$/i }));

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

describe("Event Handlers", () => {
  describe("Foriegn", () => {
    test("should trigger statistic creation", () => {
      const handleCreateClick = jest.fn();

      render(
        <StatisticTable
          title={DEFAULT_PROPS.title}
          data={DEFAULT_PROPS.data}
          onCreateClick={handleCreateClick}
        />
      );

      userEvent.click(
        screen.getByRole("button", { name: /create statistic/i })
      );

      expect(handleCreateClick).toBeCalledTimes(1);
    });

    test("should trigger statistic deletion", () => {
      const [first] = DEFAULT_PROPS.data;
      const {
        statistic: { name },
      } = first;
      const handleDeleteClick = jest.fn();

      render(
        <StatisticTable
          title={DEFAULT_PROPS.title}
          data={DEFAULT_PROPS.data}
          onDeleteClick={handleDeleteClick}
        />
      );

      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`delete: ${name}`),
        })
      );

      expect(handleDeleteClick).toBeCalledTimes(1);
    });

    test("should trigger statistic rename", () => {
      const [first] = DEFAULT_PROPS.data;
      const {
        statistic: { name },
      } = first;
      const handleRenameClick = jest.fn();

      render(
        <StatisticTable
          title={DEFAULT_PROPS.title}
          data={DEFAULT_PROPS.data}
          onRenameStatistic={handleRenameClick}
        />
      );

      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`rename: ${name}`),
        })
      );
      userEvent.click(screen.getByRole("button", { name: /^rename$/i }));

      expect(handleRenameClick).toBeCalledTimes(1);
    });

    test("should trigger statistic value change and blur", () => {
      const [first] = DEFAULT_PROPS.data;
      const {
        statistic: { name },
      } = first;
      const onStatisticValueChange = jest.fn();
      const onStatisticValueBlur = jest.fn();

      render(
        <StatisticTable
          title={DEFAULT_PROPS.title}
          data={DEFAULT_PROPS.data}
          onStatisticValueChange={onStatisticValueChange}
          onStatisticValueBlur={onStatisticValueBlur}
        />
      );

      const valueTextboxEl = screen.getByRole("spinbutton", { name });
      userEvent.clear(valueTextboxEl);
      userEvent.type(valueTextboxEl, "20");
      valueTextboxEl.blur();

      expect(onStatisticValueChange).toBeCalled();
      expect(onStatisticValueBlur).toBeCalledTimes(1);
    });
  });

  describe("Domestic", () => {
    const validName = "Valid Name";

    test("should update statistic name when changing to valid name", () => {
      const data = [...DEFAULT_PROPS.data];
      const [first] = data;
      const {
        statistic: { name },
      } = first;

      render(<StatisticTable title={DEFAULT_PROPS.title} data={data} />);

      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`rename: ${name}`, "i"),
        })
      );

      const nameTextboxEl = screen.getByRole("textbox", {
        name: /new name/i,
      });
      userEvent.clear(nameTextboxEl);
      userEvent.type(nameTextboxEl, validName);
      nameTextboxEl.blur();

      expect(nameTextboxEl).toHaveValue(validName);
    });

    test("should revert to prior valid statistic name when changing to invalid name", () => {
      const data = [...DEFAULT_PROPS.data];
      const [first] = data;
      const {
        statistic: { name },
      } = first;
      const invalidName = "   ";

      render(<StatisticTable title={DEFAULT_PROPS.title} data={data} />);

      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`rename: ${name}`, "i"),
        })
      );

      const nameTextboxEl = screen.getByRole("textbox", {
        name: /new name/i,
      });
      userEvent.clear(nameTextboxEl);
      userEvent.type(nameTextboxEl, validName);
      userEvent.clear(nameTextboxEl);
      userEvent.type(nameTextboxEl, invalidName);
      nameTextboxEl.blur();

      expect(nameTextboxEl).toHaveValue(validName);
    });

    test("should revert to prior valid statistic name when leaving name blank", () => {
      const data = [...DEFAULT_PROPS.data];
      const [first] = data;
      const {
        statistic: { name },
      } = first;

      render(<StatisticTable title={DEFAULT_PROPS.title} data={data} />);

      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`rename: ${name}`, "i"),
        })
      );

      const nameTextboxEl = screen.getByRole("textbox", {
        name: /new name/i,
      });
      userEvent.clear(nameTextboxEl);
      userEvent.type(nameTextboxEl, validName);
      userEvent.clear(nameTextboxEl);
      nameTextboxEl.blur();

      expect(nameTextboxEl).toHaveValue(validName);
    });

    test("should set renaming textbox to the associated statistic's name", () => {
      const data = [...DEFAULT_PROPS.data];
      const [first, second] = data;
      const {
        statistic: { name: firstsName },
      } = first;
      const {
        statistic: { name: secondsName },
      } = second;

      render(<StatisticTable title={DEFAULT_PROPS.title} data={data} />);

      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`rename: ${firstsName}`),
        })
      );

      const renameInputEl = screen.getByRole("textbox", {
        name: /new name/i,
      });
      userEvent.clear(renameInputEl);
      userEvent.type(renameInputEl, validName);
      userEvent.click(screen.getByRole("button", { name: /^rename$/i }));

      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`rename: ${secondsName}`),
        })
      );

      expect(screen.getByRole("textbox", { name: /new name/i })).toHaveValue(
        secondsName
      );
    });
  });
});
