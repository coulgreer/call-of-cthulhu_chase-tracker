import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ParticipantRow from ".";

const name = "TEST_NAME";

describe("Collapse/Expand detailed data", () => {
  test("should render participant information properly when collapsed", () => {
    render(<ParticipantRow defaultParticipantName={name} />);

    expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();

    expect(
      screen.queryByText(ParticipantRow.WARNING_MESSAGE)
    ).not.toBeVisible();

    expect(screen.getByLabelText(ParticipantRow.DEX_TITLE)).toBeInTheDocument();
    expect(screen.getByLabelText(ParticipantRow.MOV_TITLE)).toBeInTheDocument();
    expect(
      screen.getByLabelText(ParticipantRow.SPEED_TITLE)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /generate/i })
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /expand/i })).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: /speed stats/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(ParticipantRow.CON_TITLE)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(ParticipantRow.DRIVE_TITLE)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(ParticipantRow.RIDE_TITLE)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(ParticipantRow.AIR_TITLE)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(ParticipantRow.SEA_TITLE)
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /add speed stat/i })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: /hazard stats/i })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByLabelText(ParticipantRow.STR_TITLE)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(ParticipantRow.CLIMB_TITLE)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(ParticipantRow.SWIM_TITLE)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(ParticipantRow.DODGE_TITLE)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(ParticipantRow.BRAWL_TITLE)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(ParticipantRow.HANDGUN_TITLE)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(ParticipantRow.RIFLE_TITLE)
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /add hazard stat/i })
    ).not.toBeInTheDocument();
  });

  test("should render participant information properly when expanded", () => {
    render(<ParticipantRow defaultParticipantName={name} />);

    const buttonEl = screen.getByRole("button", { name: /expand/i });
    userEvent.click(buttonEl);

    expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();

    expect(
      screen.queryByText(ParticipantRow.WARNING_MESSAGE)
    ).not.toBeVisible();

    expect(screen.getByLabelText(ParticipantRow.DEX_TITLE)).toBeInTheDocument();
    expect(screen.getByLabelText(ParticipantRow.MOV_TITLE)).toBeInTheDocument();
    expect(
      screen.getByLabelText(ParticipantRow.SPEED_TITLE)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /generate/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /speed stats/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(ParticipantRow.CON_TITLE)).toBeInTheDocument();
    expect(
      screen.getByLabelText(ParticipantRow.DRIVE_TITLE)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(ParticipantRow.RIDE_TITLE)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(ParticipantRow.AIR_TITLE)).toBeInTheDocument();
    expect(screen.getByLabelText(ParticipantRow.SEA_TITLE)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /add speed stat/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /hazard stats/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(ParticipantRow.STR_TITLE)).toBeInTheDocument();
    expect(
      screen.getByLabelText(ParticipantRow.CLIMB_TITLE)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(ParticipantRow.SWIM_TITLE)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(ParticipantRow.DODGE_TITLE)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(ParticipantRow.BRAWL_TITLE)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(ParticipantRow.HANDGUN_TITLE)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(ParticipantRow.RIFLE_TITLE)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /add hazard stat/i })
    ).toBeInTheDocument();
  });
});

describe("Participant name rendering", () => {
  const defaultName = "Default Name";

  test("should render given name when changed from default name", () => {
    const newName = "Test Name";
    render(<ParticipantRow defaultParticipantName={defaultName} />);

    const inputEl = screen.getByRole("textbox", { name: /name/i });
    userEvent.clear(inputEl);
    userEvent.type(inputEl, newName);

    expect(inputEl).toHaveValue(newName);
  });

  test("should render the last valid name when name changed to empty string", () => {
    const validName = "Valid";
    const invalidName = "";
    render(<ParticipantRow defaultParticipantName={defaultName} />);

    const inputEl = screen.getByRole("textbox", { name: /name/i });
    userEvent.clear(inputEl);
    userEvent.type(inputEl, validName);
    userEvent.clear(inputEl);
    userEvent.type(inputEl, invalidName);
    inputEl.blur();

    expect(inputEl).toHaveDisplayValue(validName);
  });

  test("should render the last valid name when name changed to invalid value with trailing and/or leading spaces", () => {
    const validName = "Valid";
    const invalidName = "    ";
    render(<ParticipantRow defaultParticipantName={defaultName} />);

    const inputEl = screen.getByRole("textbox", { name: /name/i });
    userEvent.clear(inputEl);
    userEvent.type(inputEl, validName);
    userEvent.clear(inputEl);

    expect(
      screen.getByText(ParticipantRow.WARNING_MESSAGE)
    ).toBeInTheDocument();

    userEvent.type(inputEl, invalidName);
    inputEl.blur();

    expect(
      screen.queryByText(ParticipantRow.WARNING_MESSAGE)
    ).not.toBeVisible();
    expect(inputEl).toHaveDisplayValue(validName);
  });

  test("should render with a warning message when an invalid name is displayed then hide the message upon receiving a valid character", () => {
    const validName = "valid";
    render(<ParticipantRow defaultParticipantName={defaultName} />);

    const inputEl = screen.getByRole("textbox", { name: /name/i });
    userEvent.clear(inputEl);

    expect(
      screen.getByText(ParticipantRow.WARNING_MESSAGE)
    ).toBeInTheDocument();
    expect(inputEl).toHaveDisplayValue("");

    userEvent.type(inputEl, validName);

    expect(
      screen.queryByText(ParticipantRow.WARNING_MESSAGE)
    ).not.toBeVisible();
    expect(inputEl).toHaveDisplayValue(validName);
  });
});

describe("Statistic data manipulation", () => {
  test("should add speed stat when 'add speed stat' button clicked", () => {
    render(<ParticipantRow defaultParticipantName={name} />);
    // Need to expand the extended view due to the children elements not existing otherwise.
    userEvent.click(screen.getByRole("button", { name: /expand/i }));

    expect(screen.queryByLabelText(/new stat #6/i)).not.toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: /add speed stat/i }));

    expect(screen.getByLabelText(/new stat #6/i)).toBeInTheDocument();
  });

  test("should remove given speed stat when the 'remove speed stat' is clicked", () => {
    render(<ParticipantRow defaultParticipantName={name} />);
    // Need to expand the extended view due to the children elements not existing otherwise.
    userEvent.click(screen.getByRole("button", { name: /expand/i }));

    expect(
      screen.getByLabelText(new RegExp(ParticipantRow.CON_TITLE, "i"))
    ).toBeInTheDocument();

    userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`remove: ${ParticipantRow.CON_TITLE}`, "i"),
      })
    );

    expect(
      screen.queryByLabelText(new RegExp(ParticipantRow.CON_TITLE, "i"))
    ).not.toBeInTheDocument();
  });

  test("should add hazard stat when 'add hazard stat' clicked", () => {
    render(<ParticipantRow defaultParticipantName={name} />);
    // Need to expand the extended view due to the children elements not existing otherwise.
    userEvent.click(screen.getByRole("button", { name: /expand/i }));

    expect(screen.queryByLabelText(/new stat #8/i)).not.toBeInTheDocument();

    userEvent.click(
      screen.getByRole("button", {
        name: /add hazard stat/i,
      })
    );

    expect(screen.getByLabelText(/new stat #8/i)).toBeInTheDocument();
  });

  test("should remove given hazard stat when the 'remove hazard stat' is clicked", () => {
    render(<ParticipantRow defaultParticipantName={name} />);
    // Need to expand the extended view due to the children elements not existing otherwise.
    userEvent.click(screen.getByRole("button", { name: /expand/i }));

    expect(
      screen.getByLabelText(new RegExp(ParticipantRow.STR_TITLE, "i"))
    ).toBeInTheDocument();

    userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`remove: ${ParticipantRow.STR_TITLE}`, "i"),
      })
    );

    expect(
      screen.queryByLabelText(new RegExp(ParticipantRow.STR_TITLE, "i"))
    ).not.toBeInTheDocument();
  });

  describe("when a statistic is deleted", () => {
    test("should add a speed stat with the appropriate name when creating a new speed stat", () => {
      render(<ParticipantRow defaultParticipantName={name} />);
      // Need to expand the extended view due to the children elements not existing otherwise.
      userEvent.click(screen.getByRole("button", { name: /expand/i }));

      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`remove: ${ParticipantRow.CON_TITLE}`, "i"),
        })
      );
      userEvent.click(screen.getByRole("button", { name: /add speed stat/i }));

      expect(
        screen.getByLabelText(`${ParticipantRow.DEFAULT_STAT_NAME} #1`)
      ).toBeInTheDocument();
    });

    test("should add a hazard stat with the appropriate name when creating a new hazard stat", () => {
      render(<ParticipantRow defaultParticipantName={name} />);
      // Need to expand the extended view due to the children elements not existing otherwise.
      userEvent.click(screen.getByRole("button", { name: /expand/i }));

      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`remove: ${ParticipantRow.STR_TITLE}`, "i"),
        })
      );
      userEvent.click(screen.getByRole("button", { name: /add hazard stat/i }));

      expect(
        screen.getByLabelText(`${ParticipantRow.DEFAULT_STAT_NAME} #1`)
      ).toBeInTheDocument();
    });
  });
});

describe("Statistic Display event handlers", () => {
  const validInput = 11;

  test("should change 'main statistic' to the last valid value when changed to an invalid value and focus lost", () => {
    render(<ParticipantRow defaultParticipantName={name} />);

    const statisticDisplayEl = screen.getByRole("spinbutton", {
      name: ParticipantRow.DEX_TITLE,
    });
    userEvent.clear(statisticDisplayEl);
    userEvent.type(statisticDisplayEl, validInput.toString());
    userEvent.clear(statisticDisplayEl);

    expect(statisticDisplayEl).toHaveDisplayValue("");
    expect(statisticDisplayEl).toHaveValue(null);

    statisticDisplayEl.blur();

    expect(statisticDisplayEl).toHaveDisplayValue(validInput.toString());
    expect(statisticDisplayEl).toHaveValue(validInput);
  });

  test("should change 'speed statistic' to the last valid value when changed to an invalid value and focus lost", () => {
    render(<ParticipantRow defaultParticipantName={name} />);
    // Need to expand the extended view due to the children elements not existing otherwise.
    userEvent.click(screen.getByRole("button", { name: /expand/i }));

    const statisticDisplayEl = screen.getByRole("spinbutton", {
      name: ParticipantRow.CON_TITLE,
    });
    userEvent.clear(statisticDisplayEl);
    userEvent.type(statisticDisplayEl, validInput.toString());
    userEvent.clear(statisticDisplayEl);

    expect(statisticDisplayEl).toHaveDisplayValue("");
    expect(statisticDisplayEl).toHaveValue(null);

    statisticDisplayEl.blur();

    expect(statisticDisplayEl).toHaveDisplayValue(validInput.toString());
    expect(statisticDisplayEl).toHaveValue(validInput);
  });

  test("should change 'hazard statistic' to the last valid value when changed to an invalid value and focus lost", () => {
    render(<ParticipantRow defaultParticipantName={name} />);
    // Need to expand the extended view due to the children elements not existing otherwise.
    userEvent.click(screen.getByRole("button", { name: /expand/i }));

    const statisticDisplayEl = screen.getByRole("spinbutton", {
      name: ParticipantRow.STR_TITLE,
    });
    userEvent.clear(statisticDisplayEl);
    userEvent.type(statisticDisplayEl, validInput.toString());
    userEvent.clear(statisticDisplayEl);

    expect(statisticDisplayEl).toHaveDisplayValue("");
    expect(statisticDisplayEl).toHaveValue(null);

    statisticDisplayEl.blur();

    expect(statisticDisplayEl).toHaveDisplayValue(validInput.toString());
    expect(statisticDisplayEl).toHaveValue(validInput);
  });
});

describe("Modal", () => {
  test("should reveal modal when 'generate speed modifier' button is pressed", () => {
    render(<ParticipantRow defaultParticipantName={name} />);

    userEvent.click(screen.getByRole("button", { name: /generate/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("should close modal when any button is pressed", () => {
    render(<ParticipantRow defaultParticipantName={name} />);
    userEvent.click(screen.getByRole("button", { name: /generate/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    userEvent.type(screen.getByRole("dialog"), "{esc}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
