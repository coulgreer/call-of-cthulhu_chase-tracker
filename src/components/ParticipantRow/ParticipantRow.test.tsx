import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ParticipantRow from ".";

import { Participant } from "../../types";

const DEFAULT_PROPS: {
  participant: Participant;
  onParticipantChange: (p: Participant) => void;
} = {
  participant: {
    id: "DefaultID 1",
    name: "Default Name",
    dexterity: 15,
    movementRate: 2,
    derivedSpeed: 0,
    speedStatistics: ParticipantRow.DEFAULT_SPEED_STATISTICS,
    hazardStatistics: ParticipantRow.DEFAULT_HAZARD_STATISTICS,
    isGrouped: false,
  },
  onParticipantChange: jest.fn(),
};

describe("Collapse/Expand detailed data", () => {
  const { participant } = DEFAULT_PROPS;

  const [
    constitution,
    driveAuto,
    ride,
    aircraft,
    boat,
  ] = participant.speedStatistics;

  const [
    strength,
    climb,
    swim,
    dodge,
    brawl,
    handgun,
    rifle,
  ] = participant.hazardStatistics;

  test("should render participant information properly when collapsed", () => {
    render(<ParticipantRow participant={participant} />);

    expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();

    expect(
      screen.queryByText(ParticipantRow.WARNING_MESSAGE)
    ).not.toBeVisible();

    expect(screen.getByLabelText(/dex/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/speed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/speed/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /generate/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /participant details/i })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: /speed stats/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(constitution.name)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(driveAuto.name)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(ride.name)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(aircraft.name)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(boat.name)).not.toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: /hazard stats/i })
    ).not.toBeInTheDocument();

    expect(screen.queryByLabelText(strength.name)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(climb.name)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(swim.name)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(dodge.name)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(brawl.name)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(handgun.name)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(rifle.name)).not.toBeInTheDocument();

    expect(
      screen.queryAllByRole("button", { name: /create statistic/i })
    ).toHaveLength(0);
  });

  test("should render participant information properly when expanded", () => {
    render(<ParticipantRow participant={participant} />);

    userEvent.click(
      screen.getByRole("button", { name: /participant details/i })
    );

    expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();

    expect(
      screen.queryByText(ParticipantRow.WARNING_MESSAGE)
    ).not.toBeVisible();

    expect(screen.getByLabelText(/dex/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mov/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/speed/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /generate/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /speed stats/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(constitution.name)).toBeInTheDocument();
    expect(screen.getByLabelText(driveAuto.name)).toBeInTheDocument();
    expect(screen.getByLabelText(ride.name)).toBeInTheDocument();
    expect(screen.getByLabelText(aircraft.name)).toBeInTheDocument();
    expect(screen.getByLabelText(boat.name)).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /hazard stats/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(strength.name)).toBeInTheDocument();
    expect(screen.getByLabelText(climb.name)).toBeInTheDocument();
    expect(screen.getByLabelText(swim.name)).toBeInTheDocument();
    expect(screen.getByLabelText(dodge.name)).toBeInTheDocument();
    expect(screen.getByLabelText(brawl.name)).toBeInTheDocument();
    expect(screen.getByLabelText(handgun.name)).toBeInTheDocument();
    expect(screen.getByLabelText(rifle.name)).toBeInTheDocument();

    expect(
      screen.getAllByRole("button", { name: /create statistic/i })
    ).toHaveLength(2);
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
    const handleParticipantChange = jest.fn();

    render(
      <ParticipantRow
        participant={DEFAULT_PROPS.participant}
        onParticipantChange={handleParticipantChange}
      />
    );

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

    expect(handleParticipantChange).toBeCalled();
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
  const validScore = 11;
  const [firstHazardStatistic] = ParticipantRow.DEFAULT_HAZARD_STATISTICS;
  const [firstSpeedStatistic] = ParticipantRow.DEFAULT_SPEED_STATISTICS;

  describe("when changing to valid score", () => {
    test("should revert dexterity score to prior valid score", () => {
      const participant = Object.assign(DEFAULT_PROPS.participant);
      const handleParticipantChange = jest.fn();

      render(
        <ParticipantRow
          participant={participant}
          onParticipantChange={handleParticipantChange}
        />
      );

      const statisticDisplayEl = screen.getByRole("spinbutton", {
        name: /dex/i,
      });
      userEvent.clear(statisticDisplayEl);
      userEvent.type(statisticDisplayEl, validScore.toString());
      statisticDisplayEl.blur();

      expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
      expect(statisticDisplayEl).toHaveValue(validScore);

      expect(handleParticipantChange).toBeCalled();
    });

    test("should revert derived speed score to prior valid score", () => {
      const participant = Object.assign(DEFAULT_PROPS.participant);
      const handleParticipantChange = jest.fn();

      render(
        <ParticipantRow
          participant={participant}
          onParticipantChange={handleParticipantChange}
        />
      );

      const statisticDisplayEl = screen.getByRole("spinbutton", {
        name: /speed/i,
      });
      userEvent.clear(statisticDisplayEl);
      userEvent.type(statisticDisplayEl, validScore.toString());
      statisticDisplayEl.blur();

      expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
      expect(statisticDisplayEl).toHaveValue(validScore);

      expect(handleParticipantChange).toBeCalled();
    });

    test("should revert movement rate score to prior valid score", () => {
      const participant = Object.assign(DEFAULT_PROPS.participant);
      const handleParticipantChange = jest.fn();

      render(
        <ParticipantRow
          participant={participant}
          onParticipantChange={handleParticipantChange}
        />
      );

      const statisticDisplayEl = screen.getByRole("spinbutton", {
        name: /mov/i,
      });
      userEvent.clear(statisticDisplayEl);
      userEvent.type(statisticDisplayEl, validScore.toString());
      statisticDisplayEl.blur();

      expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
      expect(statisticDisplayEl).toHaveValue(validScore);

      expect(handleParticipantChange).toBeCalled();
    });

    test("should update hazard statistic's score", () => {
      const participant = Object.assign(DEFAULT_PROPS.participant);
      const handleParticipantChange = jest.fn();

      render(
        <ParticipantRow
          participant={participant}
          onParticipantChange={handleParticipantChange}
        />
      );
      userEvent.click(
        screen.getByRole("button", { name: /participant details/i })
      );

      const statisticDisplayEl = screen.getByRole("spinbutton", {
        name: firstHazardStatistic.name,
      });
      userEvent.clear(statisticDisplayEl);
      userEvent.type(statisticDisplayEl, validScore.toString());
      statisticDisplayEl.blur();

      expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
      expect(statisticDisplayEl).toHaveValue(validScore);

      expect(handleParticipantChange).toBeCalled();
    });

    test("should update speed statistic's score", () => {
      const participant = Object.assign(DEFAULT_PROPS.participant);
      const handleParticipantChange = jest.fn();

      render(
        <ParticipantRow
          participant={participant}
          onParticipantChange={handleParticipantChange}
        />
      );
      userEvent.click(
        screen.getByRole("button", { name: /participant details/i })
      );

      const statisticDisplayEl = screen.getByRole("spinbutton", {
        name: firstSpeedStatistic.name,
      });
      userEvent.clear(statisticDisplayEl);
      userEvent.type(statisticDisplayEl, validScore.toString());
      statisticDisplayEl.blur();

      expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
      expect(statisticDisplayEl).toHaveValue(validScore);

      expect(handleParticipantChange).toBeCalled();
    });
  });

  describe("when changing to invalid score", () => {
    const invalidScore = "   ";

    test("should revert dexterity score to prior valid score", () => {
      const participant = Object.assign(DEFAULT_PROPS.participant);
      const handleParticipantChange = jest.fn();

      render(
        <ParticipantRow
          participant={participant}
          onParticipantChange={handleParticipantChange}
        />
      );

      const statisticDisplayEl = screen.getByRole("spinbutton", {
        name: /dex/i,
      });
      userEvent.clear(statisticDisplayEl);
      userEvent.type(statisticDisplayEl, validScore.toString());
      userEvent.type(statisticDisplayEl, invalidScore);
      statisticDisplayEl.blur();

      expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
      expect(statisticDisplayEl).toHaveValue(validScore);

      expect(handleParticipantChange).toBeCalled();
    });

    test("should revert derived speed score to prior valid score", () => {
      const participant = Object.assign(DEFAULT_PROPS.participant);
      const handleParticipantChange = jest.fn();

      render(
        <ParticipantRow
          participant={participant}
          onParticipantChange={handleParticipantChange}
        />
      );

      const statisticDisplayEl = screen.getByRole("spinbutton", {
        name: /speed/i,
      });
      userEvent.clear(statisticDisplayEl);
      userEvent.type(statisticDisplayEl, validScore.toString());
      userEvent.type(statisticDisplayEl, invalidScore);
      statisticDisplayEl.blur();

      expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
      expect(statisticDisplayEl).toHaveValue(validScore);

      expect(handleParticipantChange).toBeCalled();
    });

    test("should revert movement rate score to prior valid score", () => {
      const participant = Object.assign(DEFAULT_PROPS.participant);
      const handleParticipantChange = jest.fn();

      render(
        <ParticipantRow
          participant={participant}
          onParticipantChange={handleParticipantChange}
        />
      );

      const statisticDisplayEl = screen.getByRole("spinbutton", {
        name: /mov/i,
      });
      userEvent.clear(statisticDisplayEl);
      userEvent.type(statisticDisplayEl, validScore.toString());
      userEvent.type(statisticDisplayEl, invalidScore);
      statisticDisplayEl.blur();

      expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
      expect(statisticDisplayEl).toHaveValue(validScore);

      expect(handleParticipantChange).toBeCalled();
    });

    test("should revert to hazard statistic's prior valid score", () => {
      const participant = Object.assign(DEFAULT_PROPS.participant);
      const handleParticipantChange = jest.fn();

      render(
        <ParticipantRow
          participant={participant}
          onParticipantChange={handleParticipantChange}
        />
      );
      userEvent.click(
        screen.getByRole("button", { name: /participant details/i })
      );

      const statisticDisplayEl = screen.getByRole("spinbutton", {
        name: firstHazardStatistic.name,
      });
      userEvent.clear(statisticDisplayEl);
      userEvent.type(statisticDisplayEl, validScore.toString());
      userEvent.type(statisticDisplayEl, invalidScore);
      statisticDisplayEl.blur();

      expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
      expect(statisticDisplayEl).toHaveValue(validScore);

      expect(handleParticipantChange).toBeCalled();
    });

    test("should revert to speed statistic's prior valid score", () => {
      const participant = Object.assign(DEFAULT_PROPS.participant);
      const handleParticipantChange = jest.fn();

      render(
        <ParticipantRow
          participant={participant}
          onParticipantChange={handleParticipantChange}
        />
      );
      userEvent.click(
        screen.getByRole("button", { name: /participant details/i })
      );

      const statisticDisplayEl = screen.getByRole("spinbutton", {
        name: firstSpeedStatistic.name,
      });
      userEvent.clear(statisticDisplayEl);
      userEvent.type(statisticDisplayEl, validScore.toString());
      userEvent.type(statisticDisplayEl, invalidScore);
      statisticDisplayEl.blur();

      expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
      expect(statisticDisplayEl).toHaveValue(validScore);

      expect(handleParticipantChange).toBeCalled();
    });
  });

  describe("when leaving score blank", () => {
    test("should revert dexterity score to prior valid score", () => {
      const participant = Object.assign(DEFAULT_PROPS.participant);
      const handleParticipantChange = jest.fn();

      render(
        <ParticipantRow
          participant={participant}
          onParticipantChange={handleParticipantChange}
        />
      );

      const statisticDisplayEl = screen.getByRole("spinbutton", {
        name: /dex/i,
      });
      userEvent.clear(statisticDisplayEl);
      userEvent.type(statisticDisplayEl, validScore.toString());
      userEvent.clear(statisticDisplayEl);
      statisticDisplayEl.blur();

      expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
      expect(statisticDisplayEl).toHaveValue(validScore);

      expect(handleParticipantChange).toBeCalled();
    });

    test("should revert derived speed score to prior valid score", () => {
      const participant = Object.assign(DEFAULT_PROPS.participant);
      const handleParticipantChange = jest.fn();

      render(
        <ParticipantRow
          participant={participant}
          onParticipantChange={handleParticipantChange}
        />
      );

      const statisticDisplayEl = screen.getByRole("spinbutton", {
        name: /speed/i,
      });
      userEvent.clear(statisticDisplayEl);
      userEvent.type(statisticDisplayEl, validScore.toString());
      userEvent.clear(statisticDisplayEl);
      statisticDisplayEl.blur();

      expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
      expect(statisticDisplayEl).toHaveValue(validScore);

      expect(handleParticipantChange).toBeCalled();
    });

    test("should revert movement rate score to prior valid score", () => {
      const participant = Object.assign(DEFAULT_PROPS.participant);
      const handleParticipantChange = jest.fn();

      render(
        <ParticipantRow
          participant={participant}
          onParticipantChange={handleParticipantChange}
        />
      );

      const statisticDisplayEl = screen.getByRole("spinbutton", {
        name: /mov/i,
      });
      userEvent.clear(statisticDisplayEl);
      userEvent.type(statisticDisplayEl, validScore.toString());
      userEvent.clear(statisticDisplayEl);
      statisticDisplayEl.blur();

      expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
      expect(statisticDisplayEl).toHaveValue(validScore);

      expect(handleParticipantChange).toBeCalled();
    });

    test("should revert to hazard statistic's prior valid score", () => {
      const participant = Object.assign(DEFAULT_PROPS.participant);
      const handleParticipantChange = jest.fn();

      render(
        <ParticipantRow
          participant={participant}
          onParticipantChange={handleParticipantChange}
        />
      );
      userEvent.click(
        screen.getByRole("button", { name: /participant details/i })
      );

      const statisticDisplayEl = screen.getByRole("spinbutton", {
        name: firstHazardStatistic.name,
      });
      userEvent.clear(statisticDisplayEl);
      userEvent.type(statisticDisplayEl, validScore.toString());
      userEvent.clear(statisticDisplayEl);
      statisticDisplayEl.blur();

      expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
      expect(statisticDisplayEl).toHaveValue(validScore);

      expect(handleParticipantChange).toBeCalled();
    });

    test("should revert to speed statistic's prior valid score", () => {
      const participant = Object.assign(DEFAULT_PROPS.participant);
      const handleParticipantChange = jest.fn();

      render(
        <ParticipantRow
          participant={participant}
          onParticipantChange={handleParticipantChange}
        />
      );
      userEvent.click(
        screen.getByRole("button", { name: /participant details/i })
      );

      const statisticDisplayEl = screen.getByRole("spinbutton", {
        name: firstSpeedStatistic.name,
      });
      userEvent.clear(statisticDisplayEl);
      userEvent.type(statisticDisplayEl, validScore.toString());
      userEvent.clear(statisticDisplayEl);
      statisticDisplayEl.blur();

      expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
      expect(statisticDisplayEl).toHaveValue(validScore);

      expect(handleParticipantChange).toBeCalled();
    });
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
