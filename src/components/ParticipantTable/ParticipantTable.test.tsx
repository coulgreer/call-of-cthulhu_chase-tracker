import React from "react";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";

import ParticipantTable from ".";

import { Participant } from "../../types";
import ParticipantBuilder from "../../utils/participant-builder";

function createNamedParticipant(name: string): Participant {
  return new ParticipantBuilder().withName(name).build();
}

const DEFAULT_PROPS: {
  participants: Participant[];
  warningMessage: string;
  onParticipantsChange: (p: Participant[]) => void;
} = {
  participants: [
    createNamedParticipant("0"),
    createNamedParticipant("1"),
    createNamedParticipant("2"),
  ],
  warningMessage:
    "Shame. No prey for the chase. Still, keep your wits about you.",
  onParticipantsChange: jest.fn(),
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

describe("Initial State", () => {
  const { participants } = DEFAULT_PROPS;

  describe("when no participants exist", () => {
    const empty: Participant[] = [];

    test("should render properly when omitting all optional props", () => {
      render(<ParticipantTable participants={empty} />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.queryByRole("row")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create participant/i })
      ).toBeInTheDocument();
    });

    test("should render properly when including all optional props", () => {
      const { warningMessage, onParticipantsChange } = DEFAULT_PROPS;

      render(
        <ParticipantTable
          participants={empty}
          warningMessage={warningMessage}
          onParticipantsChange={onParticipantsChange}
        />
      );

      expect(screen.getByText(warningMessage)).toBeInTheDocument();
      expect(screen.queryAllByRole("row")).toHaveLength(0);
      expect(
        screen.getByRole("button", { name: /create participant/i })
      ).toBeInTheDocument();
    });
  });

  describe("when at least one participant exists", () => {
    test("should render properly when omitting all optional props", () => {
      render(<ParticipantTable participants={participants} />);

      expect(
        screen.queryByRole("alert", { name: /no.*participants/i })
      ).not.toBeInTheDocument();
      expect(screen.getAllByRole("row")).toHaveLength(participants.length);
      expect(
        screen.getByRole("button", { name: /create participant/i })
      ).toBeInTheDocument();
    });
  });
});

test("should trigger creation of a participant", () => {
  const empty: Participant[] = [];
  const handleParticipantsChange = jest.fn();

  render(
    <ParticipantTable
      participants={empty}
      onParticipantsChange={handleParticipantsChange}
    />
  );

  userEvent.click(screen.getByRole("button", { name: /create participant/i }));

  expect(handleParticipantsChange).toBeCalledTimes(1);
  expect(handleParticipantsChange).not.toBeCalledWith(empty);
});

test("should trigger update when participant changes", () => {
  const participants = [
    new ParticipantBuilder().build(),
    new ParticipantBuilder().build(),
    new ParticipantBuilder().build(),
  ];
  const handleParticipantsChange = jest.fn();
  const newName = "Test Name";

  render(
    <ParticipantTable
      participants={participants}
      onParticipantsChange={handleParticipantsChange}
    />
  );

  const [nameInput] = screen.getAllByRole("textbox", { name: /name/i });

  userEvent.type(nameInput, newName);
  nameInput.blur();

  expect(handleParticipantsChange).toBeCalledTimes(1);
  expect(handleParticipantsChange).toBeCalledWith(participants);
});

describe("Modal", () => {
  test("should trigger deletion of given particpant", () => {
    const participants = [
      new ParticipantBuilder().build(),
      new ParticipantBuilder().build(),
    ];
    const handleParticipantsChange = jest.fn();
    const [{ id: participantId }] = participants;

    render(
      <ParticipantTable
        participants={participants}
        onParticipantsChange={handleParticipantsChange}
      />
    );

    userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`remove: ${participantId}`, "i"),
      })
    );

    const modal = screen.getByRole("dialog");

    userEvent.click(within(modal).getByRole("button", { name: /^delete$/i }));

    expect(handleParticipantsChange).toBeCalledTimes(1);
    expect(handleParticipantsChange).not.toBeCalledWith(participants);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("should cancel deletion when 'esc' is pressed", () => {
    const participants = [
      new ParticipantBuilder().build(),
      new ParticipantBuilder().build(),
    ];
    const handleParticipantsChange = jest.fn();
    const [{ id: participantId }] = participants;

    render(
      <ParticipantTable
        participants={participants}
        onParticipantsChange={handleParticipantsChange}
      />
    );

    userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`remove: ${participantId}`, "i"),
      })
    );
    userEvent.keyboard("{esc}");

    expect(handleParticipantsChange).not.toBeCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("should cancel deletion when 'cancel' button is clicked", () => {
    const participants = [
      new ParticipantBuilder().build(),
      new ParticipantBuilder().build(),
    ];
    const handleParticipantsChange = jest.fn();
    const [{ id: participantId }] = participants;

    render(
      <ParticipantTable
        participants={participants}
        onParticipantsChange={handleParticipantsChange}
      />
    );

    userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`remove: ${participantId}`, "i"),
      })
    );
    userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(handleParticipantsChange).not.toBeCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
