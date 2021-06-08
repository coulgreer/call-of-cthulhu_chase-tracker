import React from "react";

import { screen, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GroupContainer from ".";
import {
  createDummyParticipant,
  createParticipant,
} from "../../utils/participant-factory";
import {
  createGroup,
  createDummyGroupWithParticipants,
  createDummyGroup,
} from "../../utils/group-factory";

import { Group, Participant } from "../../types";

const isolatedGroupName = "Group 0";
const distancingGroupName = "Group 1";
const distancingAndPursuingGroupName = "Group 2";
const pursuingGroupName = "Group 3";

const DEFAULT_PROPS: {
  groups: Group[];
  participants: Participant[];
  handleGroupChange: (g: Group) => void;
} = {
  groups: [
    createGroup(
      "0",
      isolatedGroupName,
      GroupContainer.getInvalidGroupId(),
      [],
      []
    ),
    createGroup(
      "1",
      distancingGroupName,
      GroupContainer.getInvalidGroupId(),
      [distancingAndPursuingGroupName],
      [createDummyParticipant(true)]
    ),
    createGroup(
      "2",
      distancingAndPursuingGroupName,
      distancingGroupName,
      [pursuingGroupName],
      [createDummyParticipant(true), createDummyParticipant(true)]
    ),
    createGroup(
      "3",
      pursuingGroupName,
      distancingAndPursuingGroupName,
      [],
      [
        createDummyParticipant(true),
        createDummyParticipant(true),
        createDummyParticipant(true),
      ]
    ),
  ],
  participants: [
    createDummyParticipant(),
    createDummyParticipant(),
    createDummyParticipant(),
  ],
  handleGroupChange: jest.fn(),
};

const isolatedGroupIndex = 0;
const centralGroupIndex = 2;

describe("Prop Rendering", () => {
  test("should render properly when collapsed", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupContainer ownedIndex={isolatedGroupIndex} groups={groups} />);

    expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /group details/i })
    ).toBeInTheDocument();

    expect(screen.queryByText(/chase name/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: /distancer/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /pursuers/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /members/i })
    ).not.toBeInTheDocument();
  });

  describe("when expanded", () => {
    test("should render properly when ommitting all optional props", () => {
      const { groups } = DEFAULT_PROPS;

      render(
        <GroupContainer ownedIndex={isolatedGroupIndex} groups={groups} />
      );
      userEvent.click(screen.getByRole("button", { name: /group details/i }));

      expect(
        screen.getByRole("textbox", { name: /name/i })
      ).toBeInTheDocument();

      expect(
        screen.getByText((content, element) => {
          if (!element) return false;

          const hasText = (node: Element) => {
            if (node.textContent === null) return false;

            const regex = new RegExp(
              `chase name: ${GroupContainer.getDefaultChaseName()}`,
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

      expect(
        screen.getByRole("heading", { name: /pursuers/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(GroupContainer.getNoPursuerWarningMessage())
      ).toBeInTheDocument();

      expect(
        screen.getByRole("heading", { name: /members/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(GroupContainer.getNoMemberWarningMessage())
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /add/i })).toBeDisabled();
    });

    test("should render properly when including all optional props and at least one participant is given", () => {
      const { groups, participants, handleGroupChange } = DEFAULT_PROPS;

      render(
        <GroupContainer
          ownedIndex={isolatedGroupIndex}
          groups={groups}
          participants={participants}
          onGroupChange={handleGroupChange}
        />
      );
      userEvent.click(screen.getByRole("button", { name: /group details/i }));

      expect(
        screen.getByRole("textbox", { name: /name/i })
      ).toBeInTheDocument();

      expect(
        screen.getByText((content, element) => {
          if (!element) return false;

          const hasText = (node: Element) => {
            if (node.textContent === null) return false;

            const regex = new RegExp(
              `chase name: ${GroupContainer.getDefaultChaseName()}`,
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

      userEvent.click(screen.getByRole("combobox", { name: /distancer/i }));

      expect(
        screen.getByRole("heading", { name: /pursuers/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(GroupContainer.getNoPursuerWarningMessage())
      ).toBeInTheDocument();

      expect(
        screen.getByRole("heading", { name: /members/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(GroupContainer.getNoMemberWarningMessage())
      ).toBeInTheDocument();

      expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    });

    describe("Participants", () => {
      test("should enable add button when 'participants' has at least one element", () => {
        const { groups, participants } = DEFAULT_PROPS;

        render(
          <GroupContainer
            ownedIndex={isolatedGroupIndex}
            groups={groups}
            participants={participants}
          />
        );
        userEvent.click(screen.getByRole("button", { name: /group details/i }));

        expect(screen.getByRole("button", { name: /add/i })).not.toBeDisabled();
      });

      test("should disable add button when 'participants' is empty", () => {
        const { groups } = DEFAULT_PROPS;

        const empty: Participant[] = [];

        render(
          <GroupContainer
            ownedIndex={isolatedGroupIndex}
            groups={groups}
            participants={empty}
          />
        );
        userEvent.click(screen.getByRole("button", { name: /group details/i }));

        expect(screen.getByRole("button", { name: /add/i })).toBeDisabled();
      });
    });
  });
});

describe("Distancer Display", () => {
  test("should show warning message when a group does not have a distancer", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupContainer ownedIndex={1} groups={groups} />);
    userEvent.click(screen.getByRole("button", { name: /group details/i }));

    const distancerEl = screen.getByRole("combobox", { name: /distancer/i });
    const warningEl = screen.getByText(
      GroupContainer.getNoDistancerWarningMessage()
    );

    distancerEl.focus();
    distancerEl.blur();

    expect(warningEl).toBeVisible();
    expect(distancerEl).toHaveAttribute(
      "aria-describedby",
      expect.stringMatching(/distancer-combobox-warning-.+/i)
    );
  });

  test("should hide warning and display current distancer when a group has a distancer", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupContainer ownedIndex={centralGroupIndex} groups={groups} />);
    userEvent.click(screen.getByRole("button", { name: /group details/i }));

    expect(
      screen.getByText(GroupContainer.getNoDistancerWarningMessage())
    ).not.toBeVisible();
  });
});

describe("Pursuer Display", () => {
  test("should show warning message when a group does not have at least one pursuer", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupContainer ownedIndex={3} groups={groups} />);
    userEvent.click(screen.getByRole("button", { name: /group details/i }));

    expect(
      screen.getByText(GroupContainer.getNoPursuerWarningMessage())
    ).toBeInTheDocument();
  });

  test("should hide warning and display current pursuer(s) when a group has any pursuers", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupContainer ownedIndex={centralGroupIndex} groups={groups} />);
    userEvent.click(screen.getByRole("button", { name: /group details/i }));

    expect(
      screen.queryByText(GroupContainer.getNoPursuerWarningMessage())
    ).not.toBeInTheDocument();

    expect(
      within(screen.getByRole("list", { name: /pursuers/i })).getAllByRole(
        "listitem"
      )
    ).toHaveLength(1);
  });
});

describe("Member Display", () => {
  describe("Boundary Movement Ratings", () => {
    test("should render members properly when none exist on the group", () => {
      const { groups } = DEFAULT_PROPS;

      render(
        <GroupContainer ownedIndex={isolatedGroupIndex} groups={groups} />
      );
      userEvent.click(screen.getByRole("button", { name: /group details/i }));

      const tableEl = screen.getByRole("table", { name: /members/i });
      expect(tableEl).toHaveAttribute(
        "aria-describedby",
        expect.stringMatching(/member-table-warning-.+/i)
      );

      expect(
        screen.getByRole("cell", { name: /arrow_upward/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("cell", { name: /arrow_downward/i })
      ).toBeInTheDocument();
      expect(screen.getAllByRole("cell", { name: /---/i })).toHaveLength(2);
      expect(screen.getAllByRole("cell", { name: /N\/A/i })).toHaveLength(2);

      expect(
        screen.getByRole("columnheader", { name: /icon/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: /name/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: /mov/i })
      ).toBeInTheDocument();

      expect(
        screen.getByRole("rowgroup", { name: /all members/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("cell", {
          name: GroupContainer.getNoMemberWarningMessage(),
        })
      ).toBeInTheDocument();

      expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    });

    test("should render properly when one participant exists in the group", () => {
      const participants = [createDummyParticipant()];
      const groups = [createDummyGroupWithParticipants(participants)];

      const [firstParticipant] = participants;

      render(<GroupContainer ownedIndex={0} groups={groups} />);
      userEvent.click(screen.getByRole("button", { name: /group details/i }));

      const tableEl = screen.getByRole("table", { name: /members/i });

      expect(
        within(tableEl).getByRole("cell", { name: /warning/i })
      ).toBeVisible();

      expect(
        within(tableEl).getByRole("cell", { name: /arrow_upward/i })
      ).toBeInTheDocument();
      expect(
        within(tableEl).getByRole("cell", { name: /arrow_downward/i })
      ).toBeInTheDocument();
      expect(
        within(tableEl).getAllByRole("cell", { name: firstParticipant.name })
      ).toHaveLength(3);
      expect(
        within(tableEl).getAllByRole("cell", {
          name: `${firstParticipant.movementRate}`,
        })
      ).toHaveLength(3);

      expect(
        within(tableEl).getByRole("row", {
          name: /member with the highest mov/i,
        })
      ).not.toHaveClass(GroupContainer.HIGHEST_MOVEMENT_CLASS_NAME);
      expect(
        within(tableEl).getByRole("row", {
          name: /member with the lowest mov/i,
        })
      ).not.toHaveClass(GroupContainer.LOWEST_MOVEMENT_CLASS_NAME);

      expect(
        screen.getByRole("columnheader", { name: /icon/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: /name/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: /mov/i })
      ).toBeInTheDocument();

      const tableBodyEl = within(tableEl).getByRole("rowgroup", {
        name: /members/i,
      });

      expect(
        within(tableBodyEl).getByRole("row", { name: firstParticipant.name })
      ).not.toHaveClass(GroupContainer.HIGHEST_MOVEMENT_CLASS_NAME);
      expect(
        within(tableBodyEl).getByRole("row", { name: firstParticipant.name })
      ).not.toHaveClass(GroupContainer.LOWEST_MOVEMENT_CLASS_NAME);
      expect(
        within(tableBodyEl).getByRole("cell", { name: /warning/i })
      ).toBeInTheDocument();

      expect(within(tableEl).getAllByRole("row")).toHaveLength(4);
    });

    test("should render properly when at least two participants exist with differing movement ratings", () => {
      const lowestMOV = 1;
      const highestMOV = 11;

      const participants = [
        createParticipant(
          "p1",
          "Participant 1",
          15,
          lowestMOV,
          1,
          [],
          [],
          true
        ),
        createParticipant(
          "p2",
          "Participant 2",
          50,
          highestMOV,
          2,
          [],
          [],
          true
        ),
      ];

      const [lowestMovParticipant, highestMovParticipant] = participants;

      const groups = [createDummyGroupWithParticipants(participants)];

      render(<GroupContainer ownedIndex={0} groups={groups} />);
      userEvent.click(screen.getByRole("button", { name: /group details/i }));

      const tableEl = screen.getByRole("table", { name: /members/i });

      expect(
        within(tableEl).getByRole("cell", { name: /arrow_upward/i })
      ).toBeInTheDocument();
      expect(
        within(tableEl).getByRole("cell", { name: /arrow_downward/i })
      ).toBeInTheDocument();

      expect(
        within(tableEl).getAllByRole("cell", {
          name: lowestMovParticipant.name,
        })
      ).toHaveLength(2);
      expect(
        within(tableEl).getAllByRole("cell", {
          name: `${lowestMovParticipant.movementRate}`,
        })
      ).toHaveLength(2);

      expect(
        within(tableEl).getAllByRole("cell", {
          name: highestMovParticipant.name,
        })
      ).toHaveLength(2);
      expect(
        within(tableEl).getAllByRole("cell", {
          name: `${highestMovParticipant.movementRate}`,
        })
      ).toHaveLength(2);

      expect(
        within(tableEl).getByRole("row", {
          name: /member with the highest mov/i,
        })
      ).toHaveClass(GroupContainer.HIGHEST_MOVEMENT_CLASS_NAME);
      expect(
        within(tableEl).getByRole("row", {
          name: /member with the lowest mov/i,
        })
      ).toHaveClass(GroupContainer.LOWEST_MOVEMENT_CLASS_NAME);

      expect(
        screen.getByRole("columnheader", { name: /icon/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: /name/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: /mov/i })
      ).toBeInTheDocument();

      const tableBodyEl = within(tableEl).getByRole("rowgroup", {
        name: /members/i,
      });

      expect(
        within(tableBodyEl).getByRole("row", {
          name: highestMovParticipant.name,
        })
      ).toHaveClass(GroupContainer.HIGHEST_MOVEMENT_CLASS_NAME);
      expect(
        within(tableBodyEl).getByRole("row", {
          name: lowestMovParticipant.name,
        })
      ).toHaveClass(GroupContainer.LOWEST_MOVEMENT_CLASS_NAME);

      expect(
        within(tableBodyEl).getAllByRole("cell", { name: /warning/i })
      ).toHaveLength(2);

      expect(within(tableEl).getAllByRole("row")).toHaveLength(5);
    });
  });

  test("should trigger 'handleGroupChange' and close modal", () => {
    const { groups, participants } = DEFAULT_PROPS;
    const handleGroupChange = jest.fn();

    const [first, second, third] = participants;

    render(
      <GroupContainer
        ownedIndex={isolatedGroupIndex}
        groups={groups}
        participants={participants}
        onGroupChange={handleGroupChange}
      />
    );
    userEvent.click(screen.getByRole("button", { name: /group details/i }));

    userEvent.click(screen.getByRole("button", { name: /add/i }));

    userEvent.click(
      screen.getByRole("checkbox", { name: new RegExp(first.name) })
    );
    expect(
      screen.getByRole("checkbox", { name: new RegExp(second.name) })
    ).toBeInTheDocument();
    userEvent.click(
      screen.getByRole("checkbox", { name: new RegExp(third.name) })
    );

    userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: /add/i })
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(handleGroupChange).toBeCalled();
  });

  // TODO (Coul Greer): Add a test for ungrouping a participant
  test("should update participant's flag for representing group ownership", () => {
    const { groups, handleGroupChange } = DEFAULT_PROPS;

    const participants = [createDummyParticipant(), createDummyParticipant()];
    const [first] = participants;

    render(
      <GroupContainer
        ownedIndex={isolatedGroupIndex}
        groups={groups}
        participants={participants}
        onGroupChange={handleGroupChange}
      />
    );
    userEvent.click(screen.getByRole("button", { name: /group details/i }));

    expect(first.isGrouped).toBeFalsy();

    userEvent.click(screen.getByRole("button", { name: /add/i }));
    userEvent.click(
      screen.getByRole("checkbox", { name: new RegExp(first.name) })
    );
    userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: /add/i })
    );

    expect(first.isGrouped).toBeTruthy();
  });

  test("should render properly when all participants are already owned by a group", () => {
    const { groups } = DEFAULT_PROPS;
    const participants = [createDummyParticipant()];

    render(
      <GroupContainer
        ownedIndex={isolatedGroupIndex}
        groups={groups}
        participants={participants}
      />
    );

    userEvent.click(screen.getByRole("button", { name: /group details/i }));
    userEvent.click(screen.getByRole("button", { name: /add/i }));

    const modalEl = screen.getByRole("dialog");
    userEvent.click(within(modalEl).getByRole("checkbox"));
    userEvent.click(within(modalEl).getByRole("button", { name: /add/i }));

    userEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(
      screen.getByText(GroupContainer.getNoAvailableParticipantWarningMessage())
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("dialog")).getByRole("button", { name: /add/i })
    ).toBeDisabled();
  });

  test("should exclude participants already owned by the given group", () => {
    const participants = [
      createDummyParticipant(),
      createDummyParticipant(true),
      createDummyParticipant(),
    ];

    const [
      { name: firstDummyName },
      groupedParticipant,
      { name: secondDummyName },
    ] = participants;

    const groups = [createDummyGroupWithParticipants([groupedParticipant])];

    render(
      <GroupContainer
        ownedIndex={0}
        groups={groups}
        participants={participants}
      />
    );
    userEvent.click(screen.getByRole("button", { name: /group details/i }));

    userEvent.click(screen.getByRole("button", { name: /add/i }));

    const modalEl = screen.getByRole("dialog");
    expect(
      within(modalEl).getByRole("checkbox", {
        name: firstDummyName,
      })
    ).toBeInTheDocument();
    expect(
      within(modalEl).queryByRole("checkbox", {
        name: groupedParticipant.name,
      })
    ).not.toBeInTheDocument();
    expect(
      within(modalEl).getByRole("checkbox", {
        name: secondDummyName,
      })
    ).toBeInTheDocument();
  });

  test("should exclude participants already owned by any other group", () => {
    const groups = [createDummyGroup()];

    const orphanedParticipant = createDummyParticipant(false);
    const fosteredParticipant = createDummyParticipant(true);
    const participants = [orphanedParticipant, fosteredParticipant];

    render(
      <GroupContainer
        ownedIndex={0}
        groups={groups}
        participants={participants}
      />
    );
    userEvent.click(screen.getByRole("button", { name: /group details/i }));

    userEvent.click(screen.getByRole("button", { name: /add/i }));

    const modalEl = screen.getByRole("dialog");
    expect(
      within(modalEl).getByRole("checkbox", {
        name: new RegExp(orphanedParticipant.name),
      })
    ).toBeInTheDocument();
    expect(
      within(modalEl).queryByRole("checkbox", {
        name: new RegExp(fosteredParticipant.name),
      })
    ).not.toBeInTheDocument();
  });

  test("should disable add button when all participants are owned", () => {
    const domesticParticipant = createDummyParticipant(true);
    const foreignParticipant = createDummyParticipant(true);
    const participants = [domesticParticipant, foreignParticipant];

    const groups = [createDummyGroupWithParticipants([domesticParticipant])];

    render(
      <GroupContainer
        ownedIndex={0}
        groups={groups}
        participants={participants}
      />
    );
    userEvent.click(screen.getByRole("button", { name: /group details/i }));

    userEvent.click(screen.getByRole("button", { name: /add/i }));

    const modalEl = screen.getByRole("dialog");
    expect(
      within(modalEl).getByRole("button", { name: /add/i })
    ).toBeDisabled();
  });
});

describe("Confirmation Tests", () => {
  test("should only show warning icon for members with boundary values", () => {
    const lowestMOV = 1;
    const highestMOV = 11;
    const middlingMOV = highestMOV - lowestMOV;

    const participants = [
      createParticipant("p1", "Participant 1", 15, lowestMOV, 1, [], [], true),
      createParticipant(
        "p2",
        "Participant 2",
        15,
        middlingMOV,
        1,
        [],
        [],
        true
      ),
      createParticipant("p3", "Participant 3", 50, highestMOV, 2, [], [], true),
    ];

    const [, { name: middlingName }] = participants;

    const groups = [createDummyGroupWithParticipants(participants)];

    render(<GroupContainer ownedIndex={0} groups={groups} />);
    userEvent.click(screen.getByRole("button", { name: /group details/i }));

    const rowEl = screen.getByRole("row", { name: middlingName });

    expect(
      within(rowEl).queryByRole("cell", { name: /warning/i })
    ).not.toBeInTheDocument();
  });
});
