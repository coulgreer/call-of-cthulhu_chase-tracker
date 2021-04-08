import React from "react";

import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GroupRow from ".";

import { Group, Participant } from "../../types";

function createParticipant(id: string): Participant {
  return {
    id,
    name: id,
    dexterity: 15,
    movementRate: 3,
    derivedSpeed: 1,
    speedSkills: [],
    hazardSkills: [],
  };
}

const isolatedGroupName = "Group 0";
const distancingGroupName = "Group 1";
const distancingAndPursuingGroupName = "Group 2";
const pursuingGroupName = "Group 3";

const DEFAULT_PROPS: { groups: Group[] } = {
  groups: [
    {
      id: "0",
      name: isolatedGroupName,
      distancerName: GroupRow.INVALID_DISTANCER_NAME,
      pursuersNames: [],
      participants: [],
    },
    {
      id: "1",
      name: distancingGroupName,
      distancerName: GroupRow.INVALID_DISTANCER_NAME,
      pursuersNames: [distancingAndPursuingGroupName],
      participants: [createParticipant("Participant 00")],
    },
    {
      id: "2",
      name: distancingAndPursuingGroupName,
      distancerName: distancingGroupName,
      pursuersNames: [pursuingGroupName],
      participants: [
        createParticipant("Participant 01"),
        createParticipant("Participant 02"),
      ],
    },
    {
      id: "3",
      name: pursuingGroupName,
      distancerName: distancingAndPursuingGroupName,
      pursuersNames: [],
      participants: [
        createParticipant("Participant 03"),
        createParticipant("Participant 04"),
        createParticipant("Participant 05"),
      ],
    },
  ],
};

const isolatedGroupIndex = 0;
const centralGroupIndex = 2;

test("should render properly when details are not expanded", () => {
  const { groups } = DEFAULT_PROPS;

  render(<GroupRow ownedIndex={isolatedGroupIndex} groups={groups} />);

  expect(screen.getByRole("button", { name: /split/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /join/i })).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();

  expect(
    screen.getByRole("button", { name: /expand more/i })
  ).toBeInTheDocument();

  expect(screen.queryByText(/chase name/i)).not.toBeInTheDocument();

  expect(
    screen.queryByRole("combobox", { name: /distancer/i })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText(GroupRow.NO_DISTANCER_WARNING_MESSAGE)
  ).not.toBeInTheDocument();

  expect(screen.queryByLabelText(/pursuer\(s\)/i)).not.toBeInTheDocument();
  expect(
    screen.queryByText(GroupRow.NO_PURSUER_WARNING_MESSAGE)
  ).not.toBeInTheDocument();

  expect(
    screen.queryByRole("heading", { name: /members/i })
  ).not.toBeInTheDocument();
  expect(screen.queryByText(/highest mov/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/lowest mov/i)).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/participants/i)).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /add/i })
  ).not.toBeInTheDocument();
});

test("should render properly when at least one participant exists in the group", () => {
  const { groups } = DEFAULT_PROPS;

  render(<GroupRow ownedIndex={centralGroupIndex} groups={groups} />);

  expect(screen.getByRole("button", { name: /split/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /join/i })).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();

  userEvent.click(screen.getByRole("button", { name: /expand more/i }));

  expect(
    screen.getByRole("button", { name: /expand less/i })
  ).toBeInTheDocument();

  expect(
    screen.getByText((content, element) => {
      if (!element) return false;

      const hasText = (node: Element) => {
        if (node.textContent === null) return false;

        const regex = new RegExp(
          `chase name: ${GroupRow.DEFAULT_CHASE_NAME}`,
          "i"
        );

        return regex.test(node.textContent);
      };

      const childrenDontHaveText = Array.from(element.children).every(
        (child) => !hasText(child)
      );

      return hasText(element) && childrenDontHaveText;
    })
  ).toBeInTheDocument();

  expect(
    screen.getByRole("combobox", { name: /distancer/i })
  ).toBeInTheDocument();

  expect(screen.getByLabelText(/pursuer\(s\)/i)).toBeInTheDocument();

  expect(screen.getByRole("heading", { name: /members/i })).toBeInTheDocument();
  expect(screen.getByText(/highest mov/i)).toBeInTheDocument();
  expect(screen.getByText(/lowest mov/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/participants/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
});

describe("Warnings", () => {
  describe("Participant", () => {
    test("should render properly when no participants exist in the group", () => {
      const { groups } = DEFAULT_PROPS;

      render(<GroupRow ownedIndex={isolatedGroupIndex} groups={groups} />);

      userEvent.click(screen.getByRole("button", { name: /expand more/i }));

      expect(
        screen.getByText(GroupRow.NO_PARTICIPANT_WARNING_MESSAGE)
      ).toBeInTheDocument();
    });

    test("should render properly when at least one participant exists in the group", () => {
      const { groups } = DEFAULT_PROPS;

      const targetIndex = centralGroupIndex;
      const { participants } = groups[targetIndex];
      const [first] = participants;

      render(<GroupRow ownedIndex={targetIndex} groups={groups} />);

      userEvent.click(screen.getByRole("button", { name: /expand more/i }));

      expect(
        screen.queryByText(GroupRow.NO_PARTICIPANT_WARNING_MESSAGE)
      ).not.toBeInTheDocument();

      expect(screen.getByText(first.name)).toBeInTheDocument();
      expect(screen.getAllByText(first.movementRate).length).toBeGreaterThan(0);
    });
  });

  describe("Distancer", () => {
    test("should show warning message when a group does not have a distancer", () => {
      const { groups } = DEFAULT_PROPS;

      render(<GroupRow ownedIndex={1} groups={groups} />);
      userEvent.click(screen.getByRole("button", { name: /expand more/i }));

      expect(
        screen.getByText(GroupRow.NO_DISTANCER_WARNING_MESSAGE)
      ).toBeVisible();
    });

    test("should hide warning and display current distancer when a group has a distancer", () => {
      const { groups } = DEFAULT_PROPS;

      render(<GroupRow ownedIndex={centralGroupIndex} groups={groups} />);
      userEvent.click(screen.getByRole("button", { name: /expand more/i }));

      expect(
        screen.getByText(GroupRow.NO_DISTANCER_WARNING_MESSAGE)
      ).not.toBeVisible();
    });
  });

  describe("Pursuer", () => {
    test("should show warning message when a group does not have at least one pursuer", () => {
      const { groups } = DEFAULT_PROPS;

      render(<GroupRow ownedIndex={3} groups={groups} />);
      userEvent.click(screen.getByRole("button", { name: /expand more/i }));

      expect(
        screen.getByText(GroupRow.NO_PURSUER_WARNING_MESSAGE)
      ).toBeVisible();
    });

    test("should hide warning and display current pursuer(s) when a group has any pursuers", () => {
      const { groups } = DEFAULT_PROPS;

      const targetIndex = centralGroupIndex;
      const { pursuersNames } = groups[targetIndex];
      const [first] = pursuersNames;

      render(<GroupRow ownedIndex={targetIndex} groups={groups} />);
      userEvent.click(screen.getByRole("button", { name: /expand more/i }));

      expect(
        screen.getByText(GroupRow.NO_PURSUER_WARNING_MESSAGE)
      ).not.toBeVisible();

      expect(screen.getAllByText(first).length).toEqual(2);
    });
  });
});
