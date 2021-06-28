import React from "react";

import { screen, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GroupTable from ".";
import GroupContainer from "../GroupContainer";
import {
  createDummyGroup,
  createDummyGroupWithParticipants,
} from "../../utils/group-factory";

import { Group, Participant } from "../../types";
import { createDummyParticipant } from "../../utils/participant-factory";

function createParticipant(id: string): Participant {
  return {
    id,
    name: id,
    dexterity: 15,
    movementRate: 3,
    derivedSpeed: 1,
    speedStatistics: [],
    hazardStatistics: [],
    isGrouped: false,
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
  handleGroupsChange: (g: Group[]) => void;
} = {
  groups: [
    {
      id: "0",
      name: isolatedGroupName,
      distancerId: GroupContainer.getInvalidGroupId(),
      pursuersIds: [],
      participants: [],
    },
    {
      id: "1",
      name: distancingGroupName,
      distancerId: GroupContainer.getInvalidGroupId(),
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
  handleGroupsChange: jest.fn(),
};

describe("Prop Rendering", () => {
  describe("when no groups exist", () => {
    const empty: Group[] = [];

    test("should render properly when ommitting all optional props", () => {
      render(<GroupTable groups={empty} />);

      expect(
        screen.getByText(GroupTable.getDefaultWarningMessage())
      ).toBeInTheDocument();
      expect(screen.queryAllByRole("row")).toHaveLength(0);
      expect(
        screen.getByRole("button", { name: /create group/i })
      ).toBeInTheDocument();
    });

    test("should render properly when including all optional props", () => {
      const { warningMessage, participants, handleGroupsChange } =
        DEFAULT_PROPS;

      render(
        <GroupTable
          warningMessage={warningMessage}
          groups={empty}
          participants={participants}
          onGroupsChange={handleGroupsChange}
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
      const cellCount = groups.length * 2;

      render(<GroupTable groups={groups} />);

      expect(screen.getAllByRole("gridcell")).toHaveLength(cellCount);
      expect(
        screen.queryByText(GroupTable.getDefaultWarningMessage())
      ).not.toBeInTheDocument();
      expect(screen.getAllByRole("row")).toHaveLength(groups.length);
      expect(screen.getAllByRole("button", { name: /split/i })).toHaveLength(
        groups.length
      );
      expect(screen.getAllByRole("button", { name: /combine/i })).toHaveLength(
        groups.length
      );
      expect(
        screen.getByRole("button", { name: /create group/i })
      ).toBeInTheDocument();
    });
  });
});

test("should trigger creation of a group", () => {
  const { groups } = DEFAULT_PROPS;
  const handleGroupsChange = jest.fn();

  render(<GroupTable groups={groups} onGroupsChange={handleGroupsChange} />);

  userEvent.click(screen.getByRole("button", { name: /create group/i }));

  expect(handleGroupsChange).toBeCalled();
});

test("should trigger update on group change", () => {
  const { groups, participants } = DEFAULT_PROPS;
  const [first, , third] = participants;
  const handleGroupsChange = jest.fn();

  render(
    <GroupTable
      groups={groups}
      participants={participants}
      onGroupsChange={handleGroupsChange}
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

  expect(handleGroupsChange).toBeCalled();
});

describe("Delete Group", () => {
  test("should render modal properly", () => {
    const { groups } = DEFAULT_PROPS;
    const label = /Would you like to delete the selected group\?/i;

    render(<GroupTable groups={groups} />);

    const [first] = screen.getAllByRole("row");
    userEvent.click(within(first).getByRole("button", { name: /delete/i }));

    const modalEl = screen.getByRole("dialog", { name: label });
    expect(
      within(modalEl).getByRole("heading", { name: label })
    ).toBeInTheDocument();
    expect(
      within(modalEl).getByRole("button", { name: /cancel/i })
    ).toBeInTheDocument();
    expect(
      within(modalEl).getByRole("button", { name: /delete/i })
    ).toBeInTheDocument();
  });

  test("should trigger deletion of given group", () => {
    const { groups } = DEFAULT_PROPS;
    const [group] = groups;
    const handleGroupsChange = jest.fn();

    render(<GroupTable groups={groups} onGroupsChange={handleGroupsChange} />);

    userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`delete ${group.id}`, "i"),
      })
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(handleGroupsChange).toBeCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  describe("when canceling", () => {
    test("should abort deletion when 'esc' is pressed", () => {
      const { groups } = DEFAULT_PROPS;
      const [group] = groups;
      const handleGroupsChange = jest.fn();

      render(
        <GroupTable groups={groups} onGroupsChange={handleGroupsChange} />
      );

      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`delete ${group.id}`, "i"),
        })
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();

      userEvent.keyboard("{esc}");

      expect(handleGroupsChange).not.toBeCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    test("should abort deletion when 'cancel' button is clicked", () => {
      const { groups } = DEFAULT_PROPS;
      const [group] = groups;
      const handleGroupsChange = jest.fn();

      render(
        <GroupTable groups={groups} onGroupsChange={handleGroupsChange} />
      );

      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`delete ${group.id}`, "i"),
        })
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();

      userEvent.click(screen.getByRole("button", { name: /cancel/i }));

      expect(handleGroupsChange).not.toBeCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});

describe("Combining", () => {
  const headerText = "Would you like to merge the selected groups?";

  test("should disable button", () => {
    const groups = [createDummyGroup()];

    render(<GroupTable groups={groups} />);

    expect(screen.getByRole("button", { name: /combine/i })).toBeDisabled();
  });

  test("should enable button", () => {
    const groups = [createDummyGroup(), createDummyGroup()];

    render(<GroupTable groups={groups} />);

    const [anyJoinButtonEl] = screen.getAllByRole("button", {
      name: /combine/i,
    });
    expect(anyJoinButtonEl).not.toBeDisabled();
  });

  test("should open modal", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupTable groups={groups} />);

    const [first] = screen.getAllByRole("row");
    userEvent.click(within(first).getByRole("button", { name: /combine/i }));

    expect(
      screen.getByRole("dialog", { name: headerText })
    ).toBeInTheDocument();
  });

  test("should close modal when 'esc' is pressed", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupTable groups={groups} />);

    const [first] = screen.getAllByRole("row");
    userEvent.click(within(first).getByRole("button", { name: /combine/i }));

    userEvent.keyboard("{esc}");

    expect(
      screen.queryByRole("dialog", { name: headerText })
    ).not.toBeInTheDocument();
  });

  test("should close modal when cancellation button is clicked", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupTable groups={groups} />);

    const [first] = screen.getAllByRole("row");
    userEvent.click(within(first).getByRole("button", { name: /combine/i }));

    userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(
      screen.queryByRole("dialog", { name: headerText })
    ).not.toBeInTheDocument();
  });

  test("should render modal properly", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupTable groups={groups} />);

    const [first] = screen.getAllByRole("row");

    userEvent.click(within(first).getByRole("button", { name: /combine/i }));

    const modalEl = screen.getByRole("dialog", { name: headerText });

    expect(
      within(modalEl).getByRole("heading", { name: headerText })
    ).toBeInTheDocument();
    expect(
      within(modalEl).getByRole("textbox", { name: /new name/i })
    ).toBeInTheDocument();
    expect(within(modalEl).getAllByRole("checkbox")).toHaveLength(
      groups.length - 1
    );
    expect(
      within(modalEl).getByText(GroupTable.getCombiningWarningMessage())
    ).toBeInTheDocument();
    expect(
      within(modalEl).getByRole("button", { name: /cancel/i })
    ).toBeInTheDocument();
    expect(
      within(modalEl).getByRole("button", { name: /combine/i })
    ).toBeInTheDocument();
  });

  test("should trigger 'onGroupsChange' groups and transfer members", () => {
    const handleGroupsChange = jest.fn();
    const groups = [
      createDummyGroupWithParticipants([]),
      createDummyGroupWithParticipants([
        createDummyParticipant(),
        createDummyParticipant(),
      ]),
    ];

    const [dominantGroup, subservientGroup] = groups;
    const { participants } = dominantGroup;

    render(<GroupTable groups={groups} onGroupsChange={handleGroupsChange} />);

    const editorEl = screen.getByRole("gridcell", {
      name: new RegExp(`${dominantGroup.name} editor`, "i"),
    });
    userEvent.click(within(editorEl).getByRole("button", { name: /combine/i }));

    const modalEl = screen.getByRole("dialog");
    userEvent.click(
      within(modalEl).getByRole("checkbox", { name: subservientGroup.name })
    );
    userEvent.click(within(modalEl).getByRole("button", { name: /combine/i }));
    userEvent.click(
      within(editorEl).getByRole("button", { name: /group details/i })
    );

    expect(handleGroupsChange).toBeCalledTimes(1);
    expect(modalEl).not.toBeInTheDocument();

    expect(
      within(
        within(editorEl).getByRole("rowgroup", { name: /all members/i })
      ).getAllByRole("row")
    ).toHaveLength(participants.length);
  });
});

describe("Splitting", () => {
  const headerText = "Transfer members";

  test("should open modal", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupTable groups={groups} />);

    const [first] = screen.getAllByRole("row");
    userEvent.click(within(first).getByRole("button", { name: /split/i }));

    expect(
      screen.getByRole("dialog", { name: headerText })
    ).toBeInTheDocument();
  });

  test("should close modal when 'esc' is pressed", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupTable groups={groups} />);

    const [first] = screen.getAllByRole("row");
    userEvent.click(within(first).getByRole("button", { name: /split/i }));
    userEvent.keyboard("{esc}");

    expect(
      screen.queryByRole("dialog", { name: headerText })
    ).not.toBeInTheDocument();
  });

  test("should close modal when 'cancel' is clicked", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupTable groups={groups} />);

    const [first] = screen.getAllByRole("row");
    userEvent.click(within(first).getByRole("button", { name: /split/i }));

    const modalEl = screen.getByRole("dialog", { name: headerText });
    userEvent.click(within(modalEl).getByRole("button", { name: /cancel/i }));

    expect(
      screen.queryByRole("dialog", { name: headerText })
    ).not.toBeInTheDocument();
  });

  test("should render modal properly", () => {
    const participants = [
      createDummyParticipant(),
      createDummyParticipant(),
      createDummyParticipant(),
    ];
    const groups = [createDummyGroupWithParticipants(participants)];
    const [
      { name: firstMember },
      { name: secondMember },
      { name: thirdMember },
    ] = participants;
    const [originalGroup] = groups;

    render(<GroupTable groups={groups} />);

    userEvent.click(screen.getByRole("button", { name: /split/i }));

    const modalEl = screen.getByRole("dialog", { name: headerText });
    const originalMembersEl = within(modalEl).getByRole("table", {
      name: originalGroup.name,
    });
    const newMembersEl = within(modalEl).getByRole("grid", {
      name: /new group/i,
    });

    expect(
      within(modalEl).getByRole("heading", { name: headerText })
    ).toBeInTheDocument();
    expect(
      within(originalMembersEl).getByRole("columnheader", { name: /member/i })
    ).toBeInTheDocument();
    expect(
      within(originalMembersEl).getByRole("columnheader", { name: /transfer/i })
    ).toBeInTheDocument();
    expect(
      within(originalMembersEl).getByRole("row", { name: firstMember })
    ).toBeInTheDocument();
    expect(
      within(originalMembersEl).getByRole("cell", { name: firstMember })
    ).toBeInTheDocument();
    expect(
      within(originalMembersEl).getByRole("row", { name: secondMember })
    ).toBeInTheDocument();
    expect(
      within(originalMembersEl).getByRole("cell", { name: secondMember })
    ).toBeInTheDocument();
    expect(
      within(originalMembersEl).getByRole("row", { name: thirdMember })
    ).toBeInTheDocument();
    expect(
      within(originalMembersEl).getByRole("cell", { name: thirdMember })
    ).toBeInTheDocument();
    expect(
      within(originalMembersEl).getAllByRole("cell", {
        name: /arrow_downward/i,
      })
    ).toHaveLength(participants.length);
    expect(
      within(modalEl).getByRole("textbox", { name: /new group name/i })
    ).toBeInTheDocument();
    expect(
      within(newMembersEl).getByRole("columnheader", { name: /member/i })
    ).toBeInTheDocument();
    expect(
      within(newMembersEl).getByRole("columnheader", { name: /transfer/i })
    ).toBeInTheDocument();
    expect(
      within(newMembersEl).getByRole("row", { name: /placeholder/i })
    ).toBeInTheDocument();
    expect(
      within(modalEl).getByRole("button", { name: /cancel/i })
    ).toBeInTheDocument();
    expect(
      within(modalEl).getByRole("button", { name: /split/i })
    ).toBeInTheDocument();
  });

  test("should switch members between groups", () => {
    const participants = [
      createDummyParticipant(),
      createDummyParticipant(),
      createDummyParticipant(),
    ];
    const groups = [createDummyGroupWithParticipants(participants)];
    const [
      { name: firstMember },
      { name: secondMember },
      { name: thirdMember },
    ] = participants;
    const [originalGroup] = groups;

    render(<GroupTable groups={groups} />);

    userEvent.click(screen.getByRole("button", { name: /split/i }));

    const modalEl = screen.getByRole("dialog", { name: headerText });
    const originalMembersEl = within(modalEl).getByRole("table", {
      name: originalGroup.name,
    });
    const newMembersEl = within(modalEl).getByRole("grid", {
      name: /new group/i,
    });

    const firstMemberRow = screen.getByRole("row", { name: firstMember });
    let secondMemberRow = screen.getByRole("row", { name: secondMember });
    userEvent.click(within(firstMemberRow).getByRole("button"));
    userEvent.click(within(secondMemberRow).getByRole("button"));

    secondMemberRow = within(
      screen.getByRole("row", { name: secondMember })
    ).getByRole("button");
    userEvent.click(secondMemberRow);

    expect(
      within(originalMembersEl).getByRole("row", { name: secondMember })
    ).toBeInTheDocument();
    expect(
      within(originalMembersEl).getByRole("row", { name: thirdMember })
    ).toBeInTheDocument();
    expect(
      within(newMembersEl).getByRole("row", { name: firstMember })
    ).toBeInTheDocument();
  });

  test("should update new group name", () => {
    const newName = "A Cool Group";
    const participants = [
      createDummyParticipant(),
      createDummyParticipant(),
      createDummyParticipant(),
    ];
    const groups = [createDummyGroupWithParticipants(participants)];

    render(<GroupTable groups={groups} />);

    userEvent.click(screen.getByRole("button", { name: /split/i }));

    const nameTextbox = within(
      screen.getByRole("dialog", { name: headerText })
    ).getByRole("textbox", { name: /new group name/i });

    userEvent.clear(nameTextbox);
    userEvent.type(nameTextbox, newName);

    expect(nameTextbox).toHaveValue(newName);
  });
});

test("should trigger 'distancerChange'", () => {
  const { groups } = DEFAULT_PROPS;
  const [group1, group2, group3] = groups;
  const handleGroupsChange = jest.fn();

  render(<GroupTable groups={groups} onGroupsChange={handleGroupsChange} />);

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

  expect(handleGroupsChange).toBeCalledTimes(6);
});
