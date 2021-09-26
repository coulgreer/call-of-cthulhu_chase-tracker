import React from "react";

import { screen, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GroupTable from ".";

import { Group, Participant } from "../../types";

import GroupBuilder from "../../utils/group-builder";
import ParticipantBuilder from "../../utils/participant-builder";

function createDummyGroup() {
  return new GroupBuilder().build();
}

function createDummyGroupWithParticipants(participants: Participant[]) {
  return new GroupBuilder().withParticipants(participants).build();
}

function createDummyParticipant(isGrouped = false) {
  return new ParticipantBuilder().setGrouped(isGrouped).build();
}

function createNamedParticipant(name: string): Participant {
  return new ParticipantBuilder().withName(name).build();
}

const membersTableHeadRowCount = 3;

const participant1 = createNamedParticipant("Participant 00");
const participant2 = createNamedParticipant("Participant 01");
const participant3 = createNamedParticipant("Participant 02");
const participant4 = createNamedParticipant("Participant 03");
const participant5 = createNamedParticipant("Participant 04");
const participant6 = createNamedParticipant("Participant 05");
const participant7 = createNamedParticipant("Participant 06");

const isolatedGroup = new GroupBuilder().withName("Group A").build();
const distancingGroup = new GroupBuilder()
  .withName("Group B")
  .withParticipants([participant1])
  .build();
const distancingAndPursuingGroup = new GroupBuilder()
  .withName("Group C")
  .withDistancer(distancingGroup)
  .withParticipants([participant2, participant3])
  .build();
const pursuingGroup = new GroupBuilder()
  .withName("Group D")
  .withDistancer(distancingAndPursuingGroup)
  .withParticipants([participant4, participant5, participant6])
  .build();

distancingGroup.pursuers.push(distancingAndPursuingGroup);
distancingAndPursuingGroup.pursuers.push(pursuingGroup);

const DEFAULT_PROPS: {
  groups: Group[];
  participants: Participant[];
  warningMessage: string;
  handleGroupsChange: (g: Group[]) => void;
} = {
  groups: [
    isolatedGroup,
    distancingGroup,
    distancingAndPursuingGroup,
    pursuingGroup,
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
  describe("when no groups exist", () => {
    const empty: Group[] = [];

    test("should render properly when ommitting all optional props", () => {
      render(<GroupTable groups={empty} />);

      expect(screen.getByRole("alert")).toHaveTextContent(/no.*groups/i);
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

      expect(screen.getByRole("alert")).toHaveTextContent(warningMessage);
      expect(
        screen.getByRole("button", { name: /create group/i })
      ).toBeInTheDocument();
    });
  });

  describe("when at least one group exists", () => {
    test("should render properly when ommitting all optional props", () => {
      const { groups } = DEFAULT_PROPS;
      const { length: rowCount } = groups;
      const cellsPerRow = 2;
      const totalCellCount = rowCount * cellsPerRow;

      render(<GroupTable groups={groups} />);

      const gridEl = screen.getByRole("grid", { name: /groups/i });

      expect(within(gridEl).getAllByRole("gridcell")).toHaveLength(
        totalCellCount
      );
      expect(
        within(gridEl).getAllByRole("button", { name: /split/i })
      ).toHaveLength(rowCount);
      expect(
        within(gridEl).getAllByRole("button", { name: /combine/i })
      ).toHaveLength(rowCount);
      expect(
        screen.getByRole("button", { name: /create group/i })
      ).toBeInTheDocument();
    });

    test("should render properly when including all optional props", () => {
      const { warningMessage, groups, participants, handleGroupsChange } =
        DEFAULT_PROPS;
      const { length: rowCount } = groups;
      const cellsPerRow = 2;
      const totalCellCount = rowCount * cellsPerRow;

      render(
        <GroupTable
          warningMessage={warningMessage}
          groups={groups}
          participants={participants}
          onGroupsChange={handleGroupsChange}
        />
      );

      const gridEl = screen.getByRole("grid", { name: /groups/i });

      expect(within(gridEl).getAllByRole("gridcell")).toHaveLength(
        totalCellCount
      );
      expect(
        within(gridEl).getAllByRole("button", { name: /split/i })
      ).toHaveLength(rowCount);
      expect(
        within(gridEl).getAllByRole("button", { name: /combine/i })
      ).toHaveLength(rowCount);
      expect(
        screen.getByRole("button", { name: /create group/i })
      ).toBeInTheDocument();
    });
  });
});

describe("Callback Triggering", () => {
  test("should trigger creation of a group", () => {
    const empty: Group[] = [];
    const handleGroupsChange = jest.fn();

    render(<GroupTable groups={empty} onGroupsChange={handleGroupsChange} />);

    userEvent.click(screen.getByRole("button", { name: /create group/i }));

    expect(handleGroupsChange).toBeCalledTimes(1);
  });

  test("should trigger update on group change", () => {
    const participant = createDummyParticipant();
    const group = createDummyGroup();
    const handleGroupsChange = jest.fn();

    render(
      <GroupTable
        groups={[group]}
        participants={[participant]}
        onGroupsChange={handleGroupsChange}
      />
    );

    const gridEl = screen.getByRole("grid", { name: /groups/i });

    userEvent.click(
      within(gridEl).getByRole("button", { name: /group details/i })
    );
    userEvent.click(within(gridEl).getByRole("button", { name: /add/i }));

    const modalEl = screen.getByRole("dialog", { name: /select participant/i });

    userEvent.click(
      within(modalEl).getByRole("checkbox", { name: participant.name })
    );
    userEvent.click(within(modalEl).getByRole("button", { name: /add/i }));

    expect(handleGroupsChange).toBeCalledTimes(1);
  });

  test("should trigger 'distancerChange'", () => {
    const { groups } = DEFAULT_PROPS;
    const [group1, group2, group3] = groups;
    const handleGroupsChange = jest.fn();

    render(<GroupTable groups={groups} onGroupsChange={handleGroupsChange} />);

    const gridEl = screen.getByRole("grid", { name: /groups/i });
    const [firstRow, secondRow, thirdRow] = within(gridEl).getAllByRole("row");

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
    userEvent.selectOptions(secondDistancerEl, group3.name);
    userEvent.selectOptions(thirdDistancerEl, group1.name);
    thirdDistancerEl.blur();

    expect(firstDistancerEl).toHaveValue(group2.id);
    expect(secondDistancerEl).toHaveValue(group3.id);
    expect(thirdDistancerEl).toHaveValue(group1.id);

    expect(handleGroupsChange).toBeCalledTimes(8);
  });
});

describe("Delete Group Button", () => {
  test("should render modal properly", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupTable groups={groups} />);

    const gridEl = screen.getByRole("grid", { name: /groups/i });
    const [first] = within(gridEl).getAllByRole("row");

    userEvent.click(within(first).getByRole("button", { name: /delete/i }));

    const modalEl = screen.getByRole("dialog", { name: /delete.*group/i });

    expect(
      within(modalEl).getByRole("heading", { name: /delete/i })
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
    const [{ id }] = groups;
    const handleGroupsChange = jest.fn();

    render(<GroupTable groups={groups} onGroupsChange={handleGroupsChange} />);

    const gridEl = screen.getByRole("grid", { name: /groups/i });
    const [first] = within(gridEl).getAllByRole("row");

    userEvent.click(
      within(first).getByRole("button", {
        name: new RegExp(`delete ${id}`, "i"),
      })
    );

    const modalEl = screen.getByRole("dialog", { name: /delete.*group/i });

    userEvent.click(within(modalEl).getByRole("button", { name: /delete/i }));

    expect(handleGroupsChange).toBeCalled();
    expect(modalEl).not.toBeInTheDocument();
  });

  test("should abort deletion when 'esc' is pressed", () => {
    const { groups } = DEFAULT_PROPS;
    const [group] = groups;
    const handleGroupsChange = jest.fn();

    render(<GroupTable groups={groups} onGroupsChange={handleGroupsChange} />);

    userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`delete ${group.id}`, "i"),
      })
    );

    userEvent.keyboard("{esc}");

    expect(handleGroupsChange).not.toBeCalled();
    expect(
      screen.queryByRole("dialog", { name: /delete/i })
    ).not.toBeInTheDocument();
  });

  test("should abort deletion when 'cancel' button is clicked", () => {
    const { groups } = DEFAULT_PROPS;
    const [{ id }] = groups;
    const handleGroupsChange = jest.fn();

    render(<GroupTable groups={groups} onGroupsChange={handleGroupsChange} />);

    userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`delete ${id}`, "i"),
      })
    );

    const modalEl = screen.getByRole("dialog", { name: /delete.*group/i });

    userEvent.click(within(modalEl).getByRole("button", { name: /cancel/i }));

    expect(handleGroupsChange).not.toBeCalled();
    expect(modalEl).not.toBeInTheDocument();
  });
});

describe("Combine Groups Button", () => {
  describe("Button", () => {
    test("should disable button", () => {
      const groups = [createDummyGroup()];

      render(<GroupTable groups={groups} />);

      const gridEl = screen.getByRole("grid", { name: /groups/i });

      expect(
        within(gridEl).getByRole("button", { name: /combine/i })
      ).toBeDisabled();
    });

    test("should enable button", () => {
      const groups = [createDummyGroup(), createDummyGroup()];

      render(<GroupTable groups={groups} />);

      const gridEl = screen.getByRole("grid", { name: /groups/i });
      const [anyCombineButtonEl] = within(gridEl).getAllByRole("button", {
        name: /combine/i,
      });

      expect(anyCombineButtonEl).not.toBeDisabled();
    });
  });

  describe("Modal", () => {
    test("should open modal", () => {
      const { groups } = DEFAULT_PROPS;

      render(<GroupTable groups={groups} />);

      const gridEl = screen.getByRole("grid", { name: /groups/i });
      const [first] = within(gridEl).getAllByRole("row");

      userEvent.click(within(first).getByRole("button", { name: /combine/i }));

      expect(
        screen.getByRole("dialog", { name: /groups/i })
      ).toBeInTheDocument();
    });

    test("should close modal when 'esc' is pressed", () => {
      const { groups } = DEFAULT_PROPS;

      render(<GroupTable groups={groups} />);

      const gridEl = screen.getByRole("grid", { name: /groups/i });
      const [first] = within(gridEl).getAllByRole("row");

      userEvent.click(within(first).getByRole("button", { name: /combine/i }));
      userEvent.keyboard("{esc}");

      expect(
        screen.queryByRole("dialog", { name: /merge/i })
      ).not.toBeInTheDocument();
    });

    test("should close modal when cancellation button is clicked", () => {
      const { groups } = DEFAULT_PROPS;

      render(<GroupTable groups={groups} />);

      const gridEl = screen.getByRole("grid", { name: /groups/i });
      const [first] = within(gridEl).getAllByRole("row");

      userEvent.click(within(first).getByRole("button", { name: /combine/i }));

      const modalEl = screen.getByRole("dialog", { name: /groups/i });

      userEvent.click(within(modalEl).getByRole("button", { name: /cancel/i }));

      expect(modalEl).not.toBeInTheDocument();
    });

    test("should render modal properly", () => {
      const groups = [createDummyGroup(), createDummyGroup()];

      render(<GroupTable groups={groups} />);

      const gridEl = screen.getByRole("grid", { name: /groups/i });
      const [first] = within(gridEl).getAllByRole("row");

      userEvent.click(within(first).getByRole("button", { name: /combine/i }));

      const modalEl = screen.getByRole("dialog", { name: /groups/i });

      expect(
        within(modalEl).getByRole("heading", { name: /combine/i })
      ).toBeInTheDocument();
      expect(
        within(modalEl).getByRole("textbox", { name: /new name/i })
      ).toBeInTheDocument();
      expect(within(modalEl).getAllByRole("checkbox")).toHaveLength(
        groups.length - 1
      );
      expect(
        within(modalEl).getByText(/will remove the selected group/i)
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

      const [
        { participants, name: dominantGroupName },
        { name: subservientGroupName },
      ] = groups;

      render(
        <GroupTable groups={groups} onGroupsChange={handleGroupsChange} />
      );

      const editorEl = screen.getByRole("gridcell", {
        name: new RegExp(`${dominantGroupName} editor`, "i"),
      });

      userEvent.click(
        within(editorEl).getByRole("button", { name: /combine/i })
      );

      const modalEl = screen.getByRole("dialog");

      userEvent.click(
        within(modalEl).getByRole("checkbox", { name: subservientGroupName })
      );
      userEvent.click(
        within(modalEl).getByRole("button", { name: /combine/i })
      );
      userEvent.click(
        within(editorEl).getByRole("button", { name: /group details/i })
      );

      const tableEl = within(editorEl).getByRole("table");

      expect(handleGroupsChange).toBeCalledTimes(1);
      expect(modalEl).not.toBeInTheDocument();
      expect(within(tableEl).getAllByRole("row")).toHaveLength(
        participants.length + membersTableHeadRowCount
      );
    });
  });
});

describe("Split Group Button", () => {
  const headerText = /Transfer members/i;

  describe("Button", () => {
    test("should disable button", () => {
      const participants = [createDummyParticipant(true)];
      const groups = [createDummyGroupWithParticipants(participants)];

      render(<GroupTable groups={groups} />);

      const gridEl = screen.getByRole("grid", { name: /groups/i });

      expect(
        within(gridEl).getByRole("button", { name: /split/i })
      ).toBeDisabled();
    });

    test("should enable button", () => {
      const participants = [
        createDummyParticipant(true),
        createDummyParticipant(true),
      ];
      const groups = [createDummyGroupWithParticipants(participants)];

      render(<GroupTable groups={groups} />);

      const gridEl = screen.getByRole("grid", { name: /groups/i });

      expect(
        within(gridEl).getByRole("button", { name: /split/i })
      ).not.toBeDisabled();
    });
  });

  describe("Modal", () => {
    test("should open modal", () => {
      const participants = [createDummyParticipant(), createDummyParticipant()];
      const groups = [createDummyGroupWithParticipants(participants)];

      render(<GroupTable groups={groups} />);

      const gridEl = screen.getByRole("grid", { name: /groups/i });
      const [first] = within(gridEl).getAllByRole("row");

      userEvent.click(within(first).getByRole("button", { name: /split/i }));

      expect(
        screen.getByRole("dialog", { name: headerText })
      ).toBeInTheDocument();
    });

    test("should close modal when 'esc' is pressed", () => {
      const participants = [createDummyParticipant(), createDummyParticipant()];
      const groups = [createDummyGroupWithParticipants(participants)];

      render(<GroupTable groups={groups} />);

      const gridEl = screen.getByRole("grid", { name: /groups/i });
      const [first] = within(gridEl).getAllByRole("row");

      userEvent.click(within(first).getByRole("button", { name: /split/i }));
      userEvent.keyboard("{esc}");

      expect(
        screen.queryByRole("dialog", { name: headerText })
      ).not.toBeInTheDocument();
    });

    test("should close modal when cancellation button is clicked", () => {
      const participants = [createDummyParticipant(), createDummyParticipant()];
      const groups = [createDummyGroupWithParticipants(participants)];

      render(<GroupTable groups={groups} />);

      const gridEl = screen.getByRole("grid", { name: /groups/i });
      const [first] = within(gridEl).getAllByRole("row");

      userEvent.click(within(first).getByRole("button", { name: /split/i }));

      const modalEl = screen.getByRole("dialog", { name: headerText });

      userEvent.click(within(modalEl).getByRole("button", { name: /cancel/i }));

      expect(modalEl).not.toBeInTheDocument();
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

      const gridEl = screen.getByRole("grid", { name: /groups/i });

      userEvent.click(within(gridEl).getByRole("button", { name: /split/i }));

      const modalEl = screen.getByRole("dialog", { name: headerText });
      const originalMembersEl = within(modalEl).getByRole("grid", {
        name: originalGroup.name,
      });
      const newMembersEl = within(modalEl).getByRole("grid", {
        name: /new group/i,
      });

      expect(
        within(modalEl).getByRole("heading", { name: headerText })
      ).toBeInTheDocument();
      expect(
        within(originalMembersEl).getByRole("gridcell", { name: firstMember })
      ).toBeInTheDocument();
      expect(
        within(originalMembersEl).getByRole("button", {
          name: new RegExp(`move ${firstMember}`, "i"),
        })
      ).toBeInTheDocument();
      expect(
        within(originalMembersEl).getByRole("gridcell", { name: secondMember })
      ).toBeInTheDocument();
      expect(
        within(originalMembersEl).getByRole("button", {
          name: new RegExp(`move ${secondMember}`, "i"),
        })
      ).toBeInTheDocument();
      expect(
        within(originalMembersEl).getByRole("gridcell", { name: thirdMember })
      ).toBeInTheDocument();
      expect(
        within(originalMembersEl).getByRole("button", {
          name: new RegExp(`move ${thirdMember}`, "i"),
        })
      ).toBeInTheDocument();
      expect(
        within(modalEl).getByRole("textbox", {
          name: /new group name/i,
        })
      ).toBeInTheDocument();
      expect(
        within(newMembersEl).getByRole("gridcell", { name: /placeholder/i })
      ).toBeInTheDocument();
      expect(
        within(modalEl).getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
      expect(
        within(modalEl).getByRole("button", { name: /split/i })
      ).toBeDisabled();
    });

    describe("New Group Name Textbox", () => {
      test("should update new group name", () => {
        const newName = "A Cool Group";
        const participants = [
          createDummyParticipant(),
          createDummyParticipant(),
          createDummyParticipant(),
        ];
        const groups = [createDummyGroupWithParticipants(participants)];

        render(<GroupTable groups={groups} />);

        const gridEl = screen.getByRole("grid", { name: /groups/i });

        userEvent.click(within(gridEl).getByRole("button", { name: /split/i }));

        const modalEl = screen.getByRole("dialog", { name: headerText });
        const nameTextbox = within(modalEl).getByRole("textbox", {
          name: /new group name/i,
        });

        userEvent.clear(nameTextbox);
        userEvent.type(nameTextbox, newName);

        expect(nameTextbox).toHaveValue(newName);
      });

      test("should reset to prior, valid name when left blank", () => {
        const newGroupName = "Slytherin";
        const participants = [
          createDummyParticipant(true),
          createDummyParticipant(true),
        ];
        const groups = [createDummyGroupWithParticipants(participants)];

        render(<GroupTable groups={groups} />);

        const gridEl = screen.getByRole("grid", { name: /groups/i });

        userEvent.click(within(gridEl).getByRole("button", { name: /split/i }));

        const modalEl = screen.getByRole("dialog", { name: /members/i });
        const nameEl = within(modalEl).getByRole("textbox", { name: /new/i });

        userEvent.clear(nameEl);
        userEvent.type(nameEl, newGroupName);
        userEvent.clear(nameEl);
        nameEl.blur();

        expect(nameEl).toHaveValue(newGroupName);
      });

      test("should reset when canceling", () => {
        const newGroupName = "The Chosen";
        const groups = [
          createDummyGroupWithParticipants([
            createDummyParticipant(true),
            createDummyParticipant(true),
          ]),
        ];

        render(<GroupTable groups={groups} />);

        const gridEl = screen.getByRole("grid", { name: /groups/i });

        userEvent.click(within(gridEl).getByRole("button", { name: /split/i }));

        let modalEl = screen.getByRole("dialog", { name: /members/i });
        let nameEl = within(modalEl).getByRole("textbox", { name: /new/i });

        userEvent.clear(nameEl);
        userEvent.type(nameEl, newGroupName);
        userEvent.click(
          within(modalEl).getByRole("button", { name: /cancel/i })
        );
        userEvent.click(within(gridEl).getByRole("button", { name: /split/i }));

        modalEl = screen.getByRole("dialog", { name: /members/i });
        nameEl = within(modalEl).getByRole("textbox", { name: /new/i });

        expect(nameEl).not.toHaveValue(newGroupName);
      });

      test("should reset when splitting", () => {
        const newGroupName = "Invading Martians";
        const groups = [
          createDummyGroupWithParticipants([
            createDummyParticipant(true),
            createDummyParticipant(true),
            createDummyParticipant(true),
          ]),
        ];

        render(<GroupTable groups={groups} />);

        const gridEl = screen.getByRole("grid", { name: /groups/i });

        userEvent.click(within(gridEl).getByRole("button", { name: /split/i }));

        let modalEl = screen.getByRole("dialog", { name: /members/i });
        let nameEl = within(modalEl).getByRole("textbox", { name: /new/i });
        const [firstMoveButton] = within(modalEl).getAllByRole("button", {
          name: /move/i,
        });

        userEvent.clear(nameEl);
        userEvent.type(nameEl, newGroupName);
        userEvent.click(firstMoveButton);
        userEvent.click(
          within(modalEl).getByRole("button", { name: /split/i })
        );
        userEvent.click(within(gridEl).getByRole("button", { name: /split/i }));

        modalEl = screen.getByRole("dialog", { name: /members/i });
        nameEl = within(modalEl).getByRole("textbox", { name: /new/i });

        expect(nameEl).not.toHaveValue(newGroupName);
      });
    });

    describe("Move-Member Button", () => {
      test("should toggle enable/disable", () => {
        const participants = [
          createDummyParticipant(),
          createDummyParticipant(),
        ];
        const groups = [createDummyGroupWithParticipants(participants)];
        const [{ name: firstParticipant }, { name: secondParticipant }] =
          participants;

        render(<GroupTable groups={groups} />);

        const gridEl = screen.getByRole("grid", { name: /groups/i });

        userEvent.click(within(gridEl).getByRole("button", { name: /split/i }));

        const modalEl = screen.getByRole("dialog", { name: headerText });

        userEvent.click(
          within(modalEl).getByRole("button", {
            name: new RegExp(`move ${firstParticipant}`, "i"),
          })
        );

        expect(
          within(modalEl).getByRole("button", {
            name: new RegExp(`move ${firstParticipant}`, "i"),
          })
        ).not.toBeDisabled();
        expect(
          within(modalEl).getByRole("button", {
            name: new RegExp(`move ${secondParticipant}`, "i"),
          })
        ).toBeDisabled();
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
        const [{ name: originalGroup }] = groups;

        render(<GroupTable groups={groups} />);

        const gridEl = screen.getByRole("grid", { name: /groups/i });

        userEvent.click(within(gridEl).getByRole("button", { name: /split/i }));

        const modalEl = screen.getByRole("dialog", { name: headerText });
        const originalMembersEl = within(modalEl).getByRole("grid", {
          name: originalGroup,
        });
        const newMembersEl = within(modalEl).getByRole("grid", {
          name: /new group/i,
        });

        const firstMemberRow = screen.getByRole("row", { name: firstMember });
        let secondMemberRow = screen.getByRole("row", { name: secondMember });

        userEvent.click(within(firstMemberRow).getByRole("button"));
        userEvent.click(within(secondMemberRow).getByRole("button"));

        secondMemberRow = screen.getByRole("row", { name: secondMember });
        userEvent.click(within(secondMemberRow).getByRole("button"));

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
    });

    describe("Confirmation Button", () => {
      test("should enable button", () => {
        const participants = [
          createDummyParticipant(true),
          createDummyParticipant(true),
        ];
        const groups = [createDummyGroupWithParticipants(participants)];
        const [{ name: firstAvailableParticipant }] = participants;

        render(<GroupTable groups={groups} participants={participants} />);

        const gridEl = screen.getByRole("grid", { name: /groups/i });

        userEvent.click(within(gridEl).getByRole("button", { name: /split/i }));

        const modalEl = screen.getByRole("dialog", { name: /member/i });

        userEvent.click(
          within(modalEl).getByRole("button", {
            name: new RegExp(`move ${firstAvailableParticipant}`, "i"),
          })
        );

        expect(
          within(modalEl).getByRole("button", { name: /split/i })
        ).not.toBeDisabled();
      });

      test("should disable button", () => {
        const participants = [
          createDummyParticipant(true),
          createDummyParticipant(true),
        ];
        const groups = [createDummyGroupWithParticipants(participants)];

        render(<GroupTable groups={groups} participants={participants} />);

        const gridEl = screen.getByRole("grid", { name: /groups/i });

        userEvent.click(within(gridEl).getByRole("button", { name: /split/i }));

        const modalEl = screen.getByRole("dialog", { name: /member/i });

        expect(
          within(modalEl).getByRole("button", { name: /split/i })
        ).toBeDisabled();
      });
    });
  });
});
