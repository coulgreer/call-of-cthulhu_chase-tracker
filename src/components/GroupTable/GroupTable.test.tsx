import React from "react";

import { screen, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GroupTable from ".";
import GroupRow from "../GroupRow";

import { Group, Participant } from "../../types";

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

const isolatedGroupName = "Group 0";
const distancingGroupName = "Group 1";
const distancingAndPursuingGroupName = "Group 2";
const pursuingGroupName = "Group 3";

const participant1 = createParticipant("Participant 00");
const participant2 = createParticipant("Participant 01");
const participant3 = createParticipant("Participant 02");
const participant4 = createParticipant("Participant 03");
const participant5 = createParticipant("Participant 04");
const participant6 = createParticipant("Participant 05");
const participant7 = createParticipant("Participant 06");

const DEFAULT_PROPS: {
  groups: Group[];
  participants: Participant[];
  warningMessage: string;
  handleCreateGroupClick: () => void;
  handleDeleteGroupClick: (i: number) => void;
  handleGroupUpdate: (g: Group) => void;
  handleDistancerBlur: (t: Group, d: Group | undefined) => void;
} = {
  groups: [
    {
      id: "0",
      name: isolatedGroupName,
      distancerId: GroupRow.INVALID_DISTANCER_ID,
      pursuersIds: [],
      participants: [],
    },
    {
      id: "1",
      name: distancingGroupName,
      distancerId: GroupRow.INVALID_DISTANCER_ID,
      pursuersIds: [distancingAndPursuingGroupName],
      participants: [participant1],
    },
    {
      id: "2",
      name: distancingAndPursuingGroupName,
      distancerId: distancingGroupName,
      pursuersIds: [pursuingGroupName],
      participants: [participant2, participant3],
    },
    {
      id: "3",
      name: pursuingGroupName,
      distancerId: distancingAndPursuingGroupName,
      pursuersIds: [],
      participants: [participant4, participant5, participant6],
    },
  ],
  participants: [
    participant1,
    participant2,
    participant3,
    participant4,
    participant5,
    participant6,
    participant7,
  ],
  warningMessage: "Warning There's an Error",
  handleCreateGroupClick: jest.fn(),
  handleDeleteGroupClick: jest.fn(),
  handleGroupUpdate: jest.fn(),
  handleDistancerBlur: jest.fn(),
};

describe("Prop Rendering", () => {
  describe("when no groups exist", () => {
    const empty: Group[] = [];

    test("should render properly when ommitting all optional props", () => {
      render(<GroupTable groups={empty} />);

      expect(
        screen.getByText(GroupTable.DEFAULT_WARNING_MESSAGE)
      ).toBeInTheDocument();
      expect(screen.queryAllByRole("row")).toHaveLength(0);
      expect(
        screen.getByRole("button", { name: /create group/i })
      ).toBeInTheDocument();
    });

    test("should render properly when including all optional props", () => {
      const {
        warningMessage,
        participants,
        handleCreateGroupClick,
        handleDeleteGroupClick,
        handleGroupUpdate,
        handleDistancerBlur,
      } = DEFAULT_PROPS;

      render(
        <GroupTable
          warningMessage={warningMessage}
          groups={empty}
          participants={participants}
          onCreateGroupClick={handleCreateGroupClick}
          onDeleteGroupClick={handleDeleteGroupClick}
          onGroupUpdate={handleGroupUpdate}
          onDistancerBlur={handleDistancerBlur}
        />
      );

      expect(screen.getByText(warningMessage)).toBeInTheDocument();
      expect(screen.queryAllByRole("row")).toHaveLength(0);
      expect(
        screen.getByRole("button", { name: /create group/i })
      ).toBeInTheDocument();
    });
  });

  describe("when at least one group exists", () => {
    test("should render properly when ommitting all optional props", () => {
      const { groups } = DEFAULT_PROPS;

      render(<GroupTable groups={groups} />);

      expect(
        screen.queryByText(GroupTable.DEFAULT_WARNING_MESSAGE)
      ).not.toBeInTheDocument();
      expect(screen.getAllByRole("row")).toHaveLength(groups.length);
      expect(
        screen.getByRole("button", { name: /create group/i })
      ).toBeInTheDocument();
    });
  });
});

test("should trigger creation of a group", () => {
  const { groups } = DEFAULT_PROPS;
  const onCreateGroupClick = jest.fn();

  render(
    <GroupTable groups={groups} onCreateGroupClick={onCreateGroupClick} />
  );

  userEvent.click(screen.getByRole("button", { name: /create group/i }));

  expect(onCreateGroupClick).toBeCalled();
});

test("should trigger update on group change", () => {
  const { groups, participants } = DEFAULT_PROPS;
  const [first, , third] = participants;
  const onGroupUpdate = jest.fn();

  render(
    <GroupTable
      groups={groups}
      participants={participants}
      onGroupUpdate={onGroupUpdate}
    />
  );

  const [rowEl] = screen.getAllByRole("row");

  userEvent.click(
    within(rowEl).getByRole("button", { name: /group details/i })
  );
  userEvent.click(within(rowEl).getByRole("button", { name: /add/i }));
  userEvent.click(
    screen.getByRole("checkbox", { name: new RegExp(first.name) })
  );
  userEvent.click(
    screen.getByRole("checkbox", { name: new RegExp(third.name) })
  );
  userEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: /add/i })
  );

  expect(onGroupUpdate).toBeCalled();
});

describe("Delete Group", () => {
  test("should trigger deletion of given group", () => {
    const { groups } = DEFAULT_PROPS;
    const [group] = groups;
    const onDeleteGroupClick = jest.fn();

    render(
      <GroupTable groups={groups} onDeleteGroupClick={onDeleteGroupClick} />
    );

    userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`delete ${group.id}`, "i"),
      })
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(onDeleteGroupClick).toBeCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  describe("when canceling", () => {
    test("should abort deletion when 'esc' is pressed", () => {
      const { groups } = DEFAULT_PROPS;
      const [group] = groups;
      const onDeleteGroupClick = jest.fn();

      render(
        <GroupTable groups={groups} onDeleteGroupClick={onDeleteGroupClick} />
      );

      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`delete ${group.id}`, "i"),
        })
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();

      userEvent.keyboard("{esc}");

      expect(onDeleteGroupClick).not.toBeCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    test("should abort deletion when 'cancel' button is clicked", () => {
      const { groups } = DEFAULT_PROPS;
      const [group] = groups;
      const onDeleteGroupClick = jest.fn();

      render(
        <GroupTable groups={groups} onDeleteGroupClick={onDeleteGroupClick} />
      );

      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`delete ${group.id}`, "i"),
        })
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();

      userEvent.click(screen.getByRole("button", { name: /cancel/i }));

      expect(onDeleteGroupClick).not.toBeCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});

test("should trigger distancer change", () => {
  const { groups } = DEFAULT_PROPS;
  const [group1, group2, group3] = groups;
  const onDistancerBlur = jest.fn();

  render(<GroupTable groups={groups} onDistancerBlur={onDistancerBlur} />);

  expect(screen.queryByRole("listitem")).not.toBeInTheDocument();

  const [firstRow, secondRow, thirdRow] = screen.getAllByRole("row");
  userEvent.click(
    within(firstRow).getByRole("button", { name: /group details/i })
  );
  userEvent.click(
    within(secondRow).getByRole("button", { name: /group details/i })
  );
  userEvent.click(
    within(thirdRow).getByRole("button", { name: /group details/i })
  );

  const firstDistancerEl = within(firstRow).getByRole("combobox", {
    name: /distancer/i,
  });
  const secondDistancerEl = within(secondRow).getByRole("combobox", {
    name: /distancer/i,
  });
  const thirdDistancerEl = within(thirdRow).getByRole("combobox", {
    name: /distancer/i,
  });

  userEvent.selectOptions(firstDistancerEl, group2.name);
  firstDistancerEl.blur();

  expect(firstDistancerEl).toHaveValue(group2.id);

  userEvent.selectOptions(secondDistancerEl, group3.name);
  secondDistancerEl.blur();

  expect(secondDistancerEl).toHaveValue(group3.id);

  userEvent.selectOptions(thirdDistancerEl, group1.name);
  thirdDistancerEl.blur();

  expect(thirdDistancerEl).toHaveValue(group1.id);

  expect(onDistancerBlur).toBeCalledTimes(3);
});

describe("Confirmation Tests", () => {
  test("should render 'no distancer' warning when row is initially added", () => {
    const { groups, warningMessage } = DEFAULT_PROPS;
    render(<GroupTable groups={groups} warningMessage={warningMessage} />);

    const [first] = groups;
    const firstRow = screen.getByRole("row", { name: first.id });
    userEvent.click(
      within(firstRow).getByRole("button", { name: /group details/i })
    );

    expect(
      within(firstRow).getByText(GroupRow.NO_DISTANCER_WARNING_MESSAGE)
    ).toBeVisible();
  });
});
