import React from "react";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ParticipantContainer from ".";

import { Participant } from "../../types";

import ParticipantBuilder from "../../utils/participant-builder";

const DEFAULT_PROPS: {
  participant: Participant;
  onParticipantChange: (p: Participant) => void;
} = {
  participant: new ParticipantBuilder()
    .withHazardStatistics(ParticipantContainer.DEFAULT_HAZARD_STATISTICS)
    .withSpeedStatistics(ParticipantContainer.DEFAULT_SPEED_STATISTICS)
    .build(),
  onParticipantChange: jest.fn(),
};

function setup() {
  const participant = new ParticipantBuilder()
    .withHazardStatistics(ParticipantContainer.DEFAULT_HAZARD_STATISTICS)
    .withSpeedStatistics(ParticipantContainer.DEFAULT_SPEED_STATISTICS)
    .build();
  const handleParticipantChange = jest.fn();

  render(
    <ParticipantContainer
      participant={participant}
      onParticipantChange={handleParticipantChange}
    />
  );

  const nameInput = screen.getByRole("textbox", { name: /name/i });
  const dexterityInput = screen.getByRole("spinbutton", { name: /dex/i });
  const speedModifierInput = screen.getByRole("spinbutton", { name: /spd/i });
  const movementRateInput = screen.getByRole("spinbutton", { name: /mov/i });

  const changeNameInput = (name: string) => {
    userEvent.clear(nameInput);
    userEvent.type(nameInput, name);
  };
  const clearNameInput = () => userEvent.clear(nameInput);
  const changeDexterityInput = (value: string) => {
    userEvent.clear(dexterityInput);
    userEvent.type(dexterityInput, value);
  };
  const clearDexterityInput = () => userEvent.clear(dexterityInput);
  const changeSpeedModifierInput = (value: string) => {
    userEvent.clear(speedModifierInput);
    userEvent.type(speedModifierInput, value);
  };
  const clearSpeedModifierInput = () => userEvent.clear(speedModifierInput);
  const changeMovementRateInput = (value: string) => {
    userEvent.clear(movementRateInput);
    userEvent.type(movementRateInput, value);
  };
  const clearMovementRateInput = () => userEvent.clear(movementRateInput);

  return {
    participant,
    handleParticipantChange,
    changeNameInput,
    clearNameInput,
    changeDexterityInput,
    clearDexterityInput,
    changeSpeedModifierInput,
    clearSpeedModifierInput,
    changeMovementRateInput,
    clearMovementRateInput,
  };
}

function setupExpandedContainer() {
  const utils = setup();
  userEvent.click(screen.getByRole("button", { name: /participant details/i }));

  const changeStatisticInput = (name: string, value: string) => {
    const regEx = new RegExp(name, "i");
    const input = screen.getByRole("spinbutton", { name: regEx });
    userEvent.clear(input);
    userEvent.type(input, value);
  };
  const clearStatisticInput = (name: string) => {
    const regEx = new RegExp(name, "i");
    const input = screen.getByRole("spinbutton", { name: regEx });
    userEvent.clear(input);
  };

  return { ...utils, changeStatisticInput, clearStatisticInput };
}

describe("Initial State", () => {
  const { participant } = DEFAULT_PROPS;

  const [constitution, driveAuto, ride, aircraft, boat] =
    participant.speedStatistics;

  const [strength, climb, swim, dodge, brawl, handgun, rifle] =
    participant.hazardStatistics;

  test("should render properly when collapsed", () => {
    render(<ParticipantContainer participant={participant} />);

    expect(screen.getByText(/actions.+/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();
    expect(
      screen.queryByText(ParticipantContainer.WARNING_MESSAGE)
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: /dex/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: /spd/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: /spd/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /generate/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /participant details/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /speed stats/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("spinbutton", { name: constitution.name })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("spinbutton", { name: driveAuto.name })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("spinbutton", { name: ride.name })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("spinbutton", { name: aircraft.name })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("spinbutton", { name: boat.name })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /hazard stats/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("spinbutton", { name: strength.name })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("spinbutton", { name: climb.name })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("spinbutton", { name: swim.name })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("spinbutton", { name: dodge.name })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("spinbutton", { name: brawl.name })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("spinbutton", { name: handgun.name })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("spinbutton", { name: rifle.name })
    ).not.toBeInTheDocument();

    expect(
      screen.queryAllByRole("button", { name: /create statistic/i })
    ).toHaveLength(0);
  });

  test("should render properly when expanded", () => {
    render(<ParticipantContainer participant={participant} />);

    userEvent.click(
      screen.getByRole("button", { name: /participant details/i })
    );

    expect(screen.getByText(/actions.+/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();

    expect(
      screen.queryByText(ParticipantContainer.WARNING_MESSAGE)
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("spinbutton", { name: /dex/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: /mov/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: /spd/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /generate/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /speed stats/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("spinbutton", { name: constitution.name })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: driveAuto.name })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: ride.name })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: aircraft.name })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: boat.name })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /hazard stats/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("spinbutton", { name: strength.name })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: climb.name })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: swim.name })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: dodge.name })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: brawl.name })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: handgun.name })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: rifle.name })
    ).toBeInTheDocument();

    expect(
      screen.getAllByRole("button", { name: /create statistic/i })
    ).toHaveLength(2);
  });
});

describe("Participant Name", () => {
  test("should update participant name", () => {
    const newName = "Test Name";
    const { participant, handleParticipantChange, changeNameInput } = setup();
    const inputEl = screen.getByRole("textbox", { name: /name/i });

    changeNameInput(newName);
    inputEl.blur();

    expect(inputEl).toHaveDisplayValue(newName);
    expect(handleParticipantChange).toBeCalledTimes(1);
    expect(handleParticipantChange).toBeCalledWith(participant);
  });

  test("should revert name to prior, valid value when the name id changed to empty string", () => {
    const validName = "Valid";
    const {
      participant,
      handleParticipantChange,
      changeNameInput,
      clearNameInput,
    } = setup();
    const inputEl = screen.getByRole("textbox", { name: /name/i });

    changeNameInput(validName);
    clearNameInput();
    inputEl.blur();

    expect(inputEl).toHaveDisplayValue(validName);
    expect(handleParticipantChange).toBeCalledTimes(1);
    expect(handleParticipantChange).toBeCalledWith(participant);
  });

  test("should revert name to prior, valid value when name changed to whitespace", () => {
    const validName = "Valid";
    const invalidName = "    ";
    const { participant, handleParticipantChange, changeNameInput } = setup();
    const inputEl = screen.getByRole("textbox", { name: /name/i });

    changeNameInput(validName);
    changeNameInput(invalidName);
    inputEl.blur();

    expect(inputEl).toHaveDisplayValue(validName);
    expect(handleParticipantChange).toBeCalledTimes(1);
    expect(handleParticipantChange).toBeCalledWith(participant);
  });

  test("should display warning message when an invalid name is displayed", () => {
    const { handleParticipantChange, clearNameInput } = setup();
    const inputEl = screen.getByRole("textbox", { name: /name/i });

    clearNameInput();

    expect(inputEl).toHaveDisplayValue("");
    expect(screen.getByRole("alert")).toHaveTextContent(
      ParticipantContainer.WARNING_MESSAGE
    );
    expect(handleParticipantChange).not.toBeCalled();
  });

  test("should hide warning message when receiving a valid character", () => {
    const validName = "valid";
    const { handleParticipantChange, changeNameInput, clearNameInput } =
      setup();
    const inputEl = screen.getByRole("textbox", { name: /name/i });

    clearNameInput();
    changeNameInput(validName);

    expect(inputEl).toHaveDisplayValue(validName);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(handleParticipantChange).not.toBeCalled();
  });
});

describe("Statistic Display", () => {
  describe("when changing to valid score", () => {
    test("should update dexterity score", () => {
      const validScore = "11";
      const { participant, handleParticipantChange, changeDexterityInput } =
        setup();
      const dexterityInput = screen.getByRole("spinbutton", {
        name: /dex/i,
      });

      changeDexterityInput(validScore);
      dexterityInput.blur();

      expect(dexterityInput).toHaveDisplayValue(validScore);
      expect(handleParticipantChange).toBeCalledTimes(1);
      expect(handleParticipantChange).toBeCalledWith(participant);
    });

    test("should update speed modifier", () => {
      const validScore = "11";
      const { participant, handleParticipantChange, changeSpeedModifierInput } =
        setup();
      const speedModifierInput = screen.getByRole("spinbutton", {
        name: /spd/i,
      });

      changeSpeedModifierInput(validScore);
      speedModifierInput.blur();

      expect(speedModifierInput).toHaveDisplayValue(validScore);
      expect(handleParticipantChange).toBeCalledTimes(1);
      expect(handleParticipantChange).toBeCalledWith(participant);
    });

    test("should update movement rate score", () => {
      const validScore = "11";
      const { participant, handleParticipantChange, changeMovementRateInput } =
        setup();
      const movementRateInput = screen.getByRole("spinbutton", {
        name: /mov/i,
      });

      changeMovementRateInput(validScore);
      movementRateInput.blur();

      expect(movementRateInput).toHaveDisplayValue(validScore);
      expect(handleParticipantChange).toBeCalledTimes(1);
      expect(handleParticipantChange).toBeCalledWith(participant);
    });

    test("should update hazard statistic score", () => {
      const validScore = "11";
      const [{ name: statisticName }] =
        ParticipantContainer.DEFAULT_HAZARD_STATISTICS;
      const { participant, handleParticipantChange, changeStatisticInput } =
        setupExpandedContainer();
      const hazardStatisticInput = screen.getByRole("spinbutton", {
        name: statisticName,
      });

      changeStatisticInput(statisticName, validScore);
      hazardStatisticInput.blur();

      expect(hazardStatisticInput).toHaveDisplayValue(validScore);
      expect(handleParticipantChange).toBeCalledTimes(1);
      expect(handleParticipantChange).toBeCalledWith(participant);
    });

    test("should update speed statistic score", () => {
      const validScore = "11";
      const [{ name: statisticName }] =
        ParticipantContainer.DEFAULT_SPEED_STATISTICS;
      const { participant, handleParticipantChange, changeStatisticInput } =
        setupExpandedContainer();
      const speedStatisticInput = screen.getByRole("spinbutton", {
        name: statisticName,
      });

      changeStatisticInput(statisticName, validScore);
      speedStatisticInput.blur();

      expect(speedStatisticInput).toHaveDisplayValue(validScore);
      expect(handleParticipantChange).toBeCalledTimes(1);
      expect(handleParticipantChange).toBeCalledWith(participant);
    });
  });

  describe("when changing to invalid score", () => {
    test("should revert dexterity score to prior, valid score", () => {
      const validScore = "11";
      const invalidScore = "   ";
      const { participant, handleParticipantChange, changeDexterityInput } =
        setup();
      const dexterityInput = screen.getByRole("spinbutton", {
        name: /dex/i,
      });

      changeDexterityInput(validScore);
      changeDexterityInput(invalidScore);
      dexterityInput.blur();

      expect(dexterityInput).toHaveDisplayValue(validScore);
      expect(handleParticipantChange).toBeCalledTimes(1);
      expect(handleParticipantChange).toBeCalledWith(participant);
    });

    test("should revert speed modifier to prior, valid score", () => {
      const validScore = "11";
      const invalidScore = "   ";
      const { participant, handleParticipantChange, changeSpeedModifierInput } =
        setup();
      const speedModifierInput = screen.getByRole("spinbutton", {
        name: /spd/i,
      });

      changeSpeedModifierInput(validScore);
      changeSpeedModifierInput(invalidScore);
      speedModifierInput.blur();

      expect(speedModifierInput).toHaveDisplayValue(validScore);
      expect(handleParticipantChange).toBeCalledTimes(1);
      expect(handleParticipantChange).toBeCalledWith(participant);
    });

    test("should revert movement rate score to prior, valid score", () => {
      const validScore = "11";
      const invalidScore = "   ";
      const { participant, handleParticipantChange, changeMovementRateInput } =
        setup();
      const movementRateInput = screen.getByRole("spinbutton", {
        name: /mov/i,
      });

      changeMovementRateInput(validScore);
      changeMovementRateInput(invalidScore);
      movementRateInput.blur();

      expect(movementRateInput).toHaveDisplayValue(validScore);
      expect(handleParticipantChange).toBeCalledTimes(1);
      expect(handleParticipantChange).toBeCalledWith(participant);
    });

    test("should revert hazard statistic to prior, valid score", () => {
      const validScore = "11";
      const invalidScore = "   ";
      const [{ name: statisticName }] =
        ParticipantContainer.DEFAULT_HAZARD_STATISTICS;
      const { participant, handleParticipantChange, changeStatisticInput } =
        setupExpandedContainer();
      const hazardStatisticInput = screen.getByRole("spinbutton", {
        name: statisticName,
      });

      changeStatisticInput(statisticName, validScore);
      changeStatisticInput(statisticName, invalidScore);
      hazardStatisticInput.blur();

      expect(hazardStatisticInput).toHaveDisplayValue(validScore);
      expect(handleParticipantChange).toBeCalledTimes(1);
      expect(handleParticipantChange).toBeCalledWith(participant);
    });

    test("should revert speed statistic to prior, valid score", () => {
      const validScore = "11";
      const invalidScore = "   ";
      const [{ name: statisticName }] =
        ParticipantContainer.DEFAULT_HAZARD_STATISTICS;
      const { participant, handleParticipantChange, changeStatisticInput } =
        setupExpandedContainer();

      const speedStatisticInput = screen.getByRole("spinbutton", {
        name: statisticName,
      });

      changeStatisticInput(statisticName, validScore);
      changeStatisticInput(statisticName, invalidScore);
      speedStatisticInput.blur();

      expect(speedStatisticInput).toHaveDisplayValue(validScore);
      expect(handleParticipantChange).toBeCalledTimes(1);
      expect(handleParticipantChange).toBeCalledWith(participant);
    });
  });

  describe("when leaving score blank", () => {
    test("should revert dexterity score to prior, valid score", () => {
      const validScore = "11";
      const {
        participant,
        handleParticipantChange,
        changeDexterityInput,
        clearDexterityInput,
      } = setup();
      const dexterityInput = screen.getByRole("spinbutton", {
        name: /dex/i,
      });

      changeDexterityInput(validScore);
      clearDexterityInput();
      dexterityInput.blur();

      expect(dexterityInput).toHaveDisplayValue(validScore);
      expect(handleParticipantChange).toBeCalledTimes(1);
      expect(handleParticipantChange).toBeCalledWith(participant);
    });

    test("should revert derived speed score to prior, valid score", () => {
      const validScore = "11";
      const {
        participant,
        handleParticipantChange,
        changeSpeedModifierInput,
        clearSpeedModifierInput,
      } = setup();
      const speedModifierInput = screen.getByRole("spinbutton", {
        name: /spd/i,
      });

      changeSpeedModifierInput(validScore);
      clearSpeedModifierInput();
      speedModifierInput.blur();

      expect(speedModifierInput).toHaveDisplayValue(validScore);
      expect(handleParticipantChange).toBeCalledTimes(1);
      expect(handleParticipantChange).toBeCalledWith(participant);
    });

    test("should revert movement rate score to prior, valid score", () => {
      const validScore = "11";
      const {
        participant,
        handleParticipantChange,
        changeMovementRateInput,
        clearMovementRateInput,
      } = setup();
      const movementRateInput = screen.getByRole("spinbutton", {
        name: /mov/i,
      });

      changeMovementRateInput(validScore);
      clearMovementRateInput();
      movementRateInput.blur();

      expect(movementRateInput).toHaveDisplayValue(validScore);
      expect(handleParticipantChange).toBeCalledTimes(1);
      expect(handleParticipantChange).toBeCalledWith(participant);
    });

    test("should revert hazard statistic to prior, valid score", () => {
      const validScore = "11";
      const [{ name: statisticName }] =
        ParticipantContainer.DEFAULT_HAZARD_STATISTICS;
      const {
        participant,
        handleParticipantChange,
        changeStatisticInput,
        clearStatisticInput,
      } = setupExpandedContainer();
      const hazardStatisticInput = screen.getByRole("spinbutton", {
        name: statisticName,
      });

      changeStatisticInput(statisticName, validScore);
      clearStatisticInput(statisticName);
      hazardStatisticInput.blur();

      expect(hazardStatisticInput).toHaveDisplayValue(validScore);
      expect(handleParticipantChange).toBeCalledTimes(1);
      expect(handleParticipantChange).toBeCalledWith(participant);
    });

    test("should revert speed statistic to prior, valid score", () => {
      const validScore = "11";
      const [{ name: statisticName }] =
        ParticipantContainer.DEFAULT_SPEED_STATISTICS;
      const {
        participant,
        handleParticipantChange,
        changeStatisticInput,
        clearStatisticInput,
      } = setupExpandedContainer();
      const speedStatisticInput = screen.getByRole("spinbutton", {
        name: statisticName,
      });

      changeStatisticInput(statisticName, validScore);
      clearStatisticInput(statisticName);
      speedStatisticInput.blur();

      expect(speedStatisticInput).toHaveDisplayValue(validScore);
      expect(handleParticipantChange).toBeCalledTimes(1);
      expect(handleParticipantChange).toBeCalledWith(participant);
    });
  });
});

describe("Modal", () => {
  test("should reveal modal when 'generate' button is clicked", () => {
    setup();

    userEvent.click(screen.getByRole("button", { name: /generate/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("should close modal when 'esc' is pressed", () => {
    setup();

    userEvent.click(screen.getByRole("button", { name: /generate/i }));
    userEvent.keyboard("{esc}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("should close modal when 'cancel' button is clicked", () => {
    setup();

    userEvent.click(screen.getByRole("button", { name: /generate/i }));

    const modal = screen.getByRole("dialog");

    userEvent.click(within(modal).getByRole("button", { name: /cancel/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
