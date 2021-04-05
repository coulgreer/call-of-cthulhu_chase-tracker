import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ParticipantRow from ".";

import { Participant } from "../../types";

const DEFAULT_PROPS: {
  participant: Participant;
  onParticipantChange: (participant: Participant) => void;
} = {
  participant: {
    id: "DefaultID 1",
    name: "Default Name",
    dexterity: 15,
    movementRate: 2,
    derivedSpeed: 0,
    speedSkills: [
      {
        name: ParticipantRow.CON_TITLE,
        score: 15,
      },
      {
        name: ParticipantRow.DRIVE_TITLE,
        score: 20,
      },
      {
        name: ParticipantRow.RIDE_TITLE,
        score: 5,
      },
      {
        name: ParticipantRow.AIR_TITLE,
        score: 1,
      },
      {
        name: ParticipantRow.SEA_TITLE,
        score: 1,
      },
    ],
    hazardSkills: [
      {
        name: ParticipantRow.STR_TITLE,
        score: 15,
      },
      {
        name: ParticipantRow.CLIMB_TITLE,
        score: 20,
      },
      {
        name: ParticipantRow.SWIM_TITLE,
        score: 20,
      },
      {
        name: ParticipantRow.DODGE_TITLE,
        score: 7,
      },
      {
        name: ParticipantRow.BRAWL_TITLE,
        score: 25,
      },
      {
        name: ParticipantRow.HANDGUN_TITLE,
        score: 20,
      },
      {
        name: ParticipantRow.RIFLE_TITLE,
        score: 25,
      },
    ],
  },
  onParticipantChange: jest.fn(),
};

describe("Collapse/Expand detailed data", () => {
  test("should render participant information properly when collapsed", () => {
    render(<ParticipantRow participant={DEFAULT_PROPS.participant} />);

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
      screen.queryAllByRole("button", { name: /create statistic/i }).length
    ).toBe(0);
  });

  test("should render participant information properly when expanded", () => {
    render(<ParticipantRow participant={DEFAULT_PROPS.participant} />);

    userEvent.click(screen.getByRole("button", { name: /expand/i }));

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
      screen.getAllByRole("button", { name: /create statistic/i }).length
    ).toBe(2);
  });
});

describe("Participant name rendering", () => {
  test("should render given name when changed from default name", () => {
    const newName = "Test Name";
    render(<ParticipantRow participant={DEFAULT_PROPS.participant} />);

    const inputEl = screen.getByRole("textbox", { name: /name/i });
    userEvent.clear(inputEl);
    userEvent.type(inputEl, newName);

    expect(inputEl).toHaveValue(newName);
  });

  test("should render the last valid name when name changed to empty string", () => {
    const validName = "Valid";
    const invalidName = "";
    render(<ParticipantRow participant={DEFAULT_PROPS.participant} />);

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
    render(<ParticipantRow participant={DEFAULT_PROPS.participant} />);

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
    render(<ParticipantRow participant={DEFAULT_PROPS.participant} />);

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

describe("Statistic Display event handlers", () => {
  const validInput = 11;

  test("should change 'main statistic' to the last valid value when changed to an invalid value and focus lost", () => {
    render(<ParticipantRow participant={DEFAULT_PROPS.participant} />);

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
});

describe("Modal", () => {
  test("should reveal modal when 'generate speed modifier' button is pressed", () => {
    render(<ParticipantRow participant={DEFAULT_PROPS.participant} />);

    userEvent.click(screen.getByRole("button", { name: /generate/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("should close modal when any button is pressed", () => {
    render(<ParticipantRow participant={DEFAULT_PROPS.participant} />);
    userEvent.click(screen.getByRole("button", { name: /generate/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    userEvent.type(screen.getByRole("dialog"), "{esc}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
