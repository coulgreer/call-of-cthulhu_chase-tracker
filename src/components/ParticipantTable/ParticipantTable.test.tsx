import React from "react";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";

import ParticipantTable from ".";

import { Participant } from "../../types";

function createParticipant(id: string): Participant {
  return {
    id,
    name: id,
    dexterity: 15,
    movementRate: 3,
    derivedSpeed: 1,
    speedStatistics: [],
    hazardStatistics: [],
  };
}

const DEFAULT_PROPS: {
  participants: Participant[];
  warningMessage: string;
  onCreateParticipantClick: () => void;
  onDeleteParticipantClick: (p: Participant | null) => void;
  onParticipantChange: (p: Participant) => void;
} = {
  participants: [
    createParticipant("0"),
    createParticipant("1"),
    createParticipant("2"),
  ],
  warningMessage:
    "Shame. No prey for the chase. Still, keep your wits about you.",
  onCreateParticipantClick: jest.fn(),
  onDeleteParticipantClick: jest.fn(),
  onParticipantChange: jest.fn(),
};

describe("Prop Rendering", () => {
  const { participants } = DEFAULT_PROPS;

  describe("when no participants exist", () => {
    const empty: Participant[] = [];

    test("should render properly when omitting all optional props", () => {
      render(<ParticipantTable participants={empty} />);

      expect(
        screen.getByText(ParticipantTable.DEFAULT_WARNING_MESSAGE)
      ).toBeInTheDocument();
      expect(screen.queryAllByRole("row")).toHaveLength(0);
      expect(
        screen.getByRole("button", { name: /create participant/i })
      ).toBeInTheDocument();
    });

    test("should render properly when including all optional props", () => {
      const {
        warningMessage,
        onCreateParticipantClick,
        onDeleteParticipantClick,
        onParticipantChange,
      } = DEFAULT_PROPS;

      render(
        <ParticipantTable
          participants={empty}
          warningMessage={warningMessage}
          onCreateParticipantClick={onCreateParticipantClick}
          onDeleteParticipantClick={onDeleteParticipantClick}
          onParticipantChange={onParticipantChange}
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
        screen.queryByText(ParticipantTable.DEFAULT_WARNING_MESSAGE)
      ).not.toBeInTheDocument();
      expect(screen.getAllByRole("row")).toHaveLength(participants.length);
      expect(
        screen.getByRole("button", { name: /create participant/i })
      ).toBeInTheDocument();
    });
  });
});

test("should trigger creation of a participant", () => {
  const { participants } = DEFAULT_PROPS;
  const onCreateParticipantClick = jest.fn();

  render(
    <ParticipantTable
      participants={participants}
      onCreateParticipantClick={onCreateParticipantClick}
    />
  );

  userEvent.click(screen.getByRole("button", { name: /create participant/i }));

  expect(onCreateParticipantClick).toBeCalled();
});

test("should trigger update when participant changes", () => {
  const { participants } = DEFAULT_PROPS;
  const onParticipantChange = jest.fn();
  const newName = "Test Name";

  render(
    <ParticipantTable
      participants={participants}
      onParticipantChange={onParticipantChange}
    />
  );

  const [rowEl] = screen.getAllByRole("row");
  const nameTextboxEl = within(rowEl).getByRole("textbox", { name: /name/i });

  userEvent.type(nameTextboxEl, newName);
  nameTextboxEl.blur();

  expect(onParticipantChange).toBeCalled();
});

describe("Delete Participant", () => {
  const { participants } = DEFAULT_PROPS;
  const [participant] = participants;

  test("should trigger deletion of given particpant", () => {
    const onDeleteParticipantClick = jest.fn();

    render(
      <ParticipantTable
        participants={participants}
        onDeleteParticipantClick={onDeleteParticipantClick}
      />
    );

    userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`remove: ${participant.id}`, "i"),
      })
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(onDeleteParticipantClick).toBeCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  describe("when canceling", () => {
    test("should abort deletion when 'esc' is pressed", () => {
      const onDeleteParticipantClick = jest.fn();

      render(
        <ParticipantTable
          participants={participants}
          onDeleteParticipantClick={onDeleteParticipantClick}
        />
      );

      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`remove: ${participant.id}`, "i"),
        })
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();

      userEvent.keyboard("{esc}");

      expect(onDeleteParticipantClick).not.toBeCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    test("should abort deletion when 'cancel' button is clicked", () => {
      const onDeleteParticipantClick = jest.fn();

      render(
        <ParticipantTable
          participants={participants}
          onDeleteParticipantClick={onDeleteParticipantClick}
        />
      );

      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`remove: ${participant.id}`, "i"),
        })
      );
      userEvent.click(screen.getByRole("button", { name: /cancel/i }));

      expect(onDeleteParticipantClick).not.toBeCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
