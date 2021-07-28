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
  ownedIndex: number;
  groups: Group[];
  participants: Participant[];
  handleGroupChange: (g: Group) => void;
} = {
  ownedIndex: 0,
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
const centralizedGroupIndex = 2;

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
  test("should render properly when collapsed", () => {
    const { groups, ownedIndex } = DEFAULT_PROPS;

    render(<GroupContainer ownedIndex={ownedIndex} groups={groups} />);

    const expandEl = screen.getByRole("button", { name: /group details/i });

    expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();
    expect(expandEl).toHaveAttribute("aria-expanded", "false");
    expect(expandEl).toHaveAttribute("aria-controls");
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
      const { groups, ownedIndex } = DEFAULT_PROPS;

      render(<GroupContainer ownedIndex={ownedIndex} groups={groups} />);

      const expandEl = screen.getByRole("button", { name: /group details/i });

      userEvent.click(expandEl);

      expect(expandEl).toHaveAttribute("aria-expanded", "true");
      expect(expandEl).toHaveAttribute("aria-controls");
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
      expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    });

    describe("Add Members Button", () => {
      test("should be enabled", () => {
        const { groups } = DEFAULT_PROPS;
        const populated = [createDummyParticipant()];

        render(
          <GroupContainer
            ownedIndex={isolatedGroupIndex}
            groups={groups}
            participants={populated}
          />
        );

        userEvent.click(screen.getByRole("button", { name: /group details/i }));

        expect(screen.getByRole("button", { name: /add/i })).not.toBeDisabled();
      });

      test("should be disabled", () => {
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

describe("Group Name", () => {
  test("should change to prior, valid name", () => {
    const newGroupName = "Weyland Yutani";
    const groups = [createDummyGroup()];

    render(<GroupContainer ownedIndex={0} groups={groups} />);

    const nameEl = screen.getByRole("textbox", { name: /name/i });

    userEvent.clear(nameEl);
    userEvent.type(nameEl, newGroupName);
    userEvent.clear(nameEl);
    nameEl.blur();

    expect(nameEl).toHaveValue(newGroupName);
  });
});

describe("Distancer Display", () => {
  test("should show warning message and display placeholder distancer", () => {
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

  test("should hide warning message and display current distancer", () => {
    const { groups } = DEFAULT_PROPS;

    render(
      <GroupContainer ownedIndex={centralizedGroupIndex} groups={groups} />
    );
    userEvent.click(screen.getByRole("button", { name: /group details/i }));

    expect(
      screen.getByText(GroupContainer.getNoDistancerWarningMessage())
    ).not.toBeVisible();
  });
});

describe("Pursuer Display", () => {
  test("should show warning messager", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupContainer ownedIndex={3} groups={groups} />);
    userEvent.click(screen.getByRole("button", { name: /group details/i }));

    expect(
      screen.getByText(GroupContainer.getNoPursuerWarningMessage())
    ).toBeInTheDocument();
  });

  test("should hide warning and display pursuers", () => {
    const { groups } = DEFAULT_PROPS;

    render(
      <GroupContainer ownedIndex={centralizedGroupIndex} groups={groups} />
    );
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

describe("Members Display", () => {
  describe("Table", () => {
    test("should render properly when no members exist on the group", () => {
      const groups = [createDummyGroupWithParticipants([])];

      render(<GroupContainer ownedIndex={0} groups={groups} />);

      userEvent.click(screen.getByRole("button", { name: /group details/i }));

      const tableEl = screen.getByRole("table", { name: /members/i });

      expect(tableEl).toHaveAttribute(
        "aria-describedby",
        expect.stringMatching(/member-table-warning-.+/i)
      );
      expect(
        within(tableEl).getByRole("cell", { name: /arrow_upward/i })
      ).toBeInTheDocument();
      expect(
        within(tableEl).getByRole("cell", { name: /arrow_downward/i })
      ).toBeInTheDocument();
      expect(
        within(tableEl).getAllByRole("cell", { name: /---/i })
      ).toHaveLength(2);
      expect(
        within(tableEl).getAllByRole("cell", { name: /N\/A/i })
      ).toHaveLength(2);
      expect(
        within(tableEl).getByRole("columnheader", { name: /icon/i })
      ).toBeInTheDocument();
      expect(
        within(tableEl).getByRole("columnheader", { name: /name/i })
      ).toBeInTheDocument();
      expect(
        within(tableEl).getByRole("columnheader", { name: /mov/i })
      ).toBeInTheDocument();
      expect(
        within(tableEl).getByRole("cell", {
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
      expect(
        within(tableEl).getByRole("row", { name: firstParticipant.name })
      ).not.toHaveClass(GroupContainer.HIGHEST_MOVEMENT_CLASS_NAME);
      expect(
        within(tableEl).getByRole("row", { name: firstParticipant.name })
      ).not.toHaveClass(GroupContainer.LOWEST_MOVEMENT_CLASS_NAME);
      expect(
        within(tableEl).getByRole("cell", { name: /warning/i })
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
      expect(
        within(tableEl).getByRole("row", {
          name: highestMovParticipant.name,
        })
      ).toHaveClass(GroupContainer.HIGHEST_MOVEMENT_CLASS_NAME);
      expect(
        within(tableEl).getByRole("row", {
          name: lowestMovParticipant.name,
        })
      ).toHaveClass(GroupContainer.LOWEST_MOVEMENT_CLASS_NAME);
      expect(
        within(tableEl).getAllByRole("cell", { name: /warning/i })
      ).toHaveLength(2);
    });
  });

  describe("Modal", () => {
    test("should trigger 'handleGroupChange' and close modal", () => {
      const groups = [createDummyGroup()];
      const participants = [createDummyParticipant()];
      const handleGroupChange = jest.fn();
      const [{ name: first }] = participants;

      render(
        <GroupContainer
          ownedIndex={0}
          groups={groups}
          participants={participants}
          onGroupChange={handleGroupChange}
        />
      );

      userEvent.click(screen.getByRole("button", { name: /details/i }));
      userEvent.click(screen.getByRole("button", { name: /add/i }));

      const modalEl = screen.getByRole("dialog", { name: /participant/i });

      userEvent.click(within(modalEl).getByRole("checkbox", { name: first }));
      userEvent.click(within(modalEl).getByRole("button", { name: /add/i }));

      expect(modalEl).not.toBeInTheDocument();
      expect(handleGroupChange).toBeCalledTimes(1);
    });

    // TODO (Coul Greer): Add a test for ungrouping a participant
    test("should render properly when all participants are in a group", () => {
      const groups = [createDummyGroup()];
      const participants = [createDummyParticipant(true)];

      render(
        <GroupContainer
          ownedIndex={0}
          groups={groups}
          participants={participants}
        />
      );

      userEvent.click(screen.getByRole("button", { name: /details/i }));
      userEvent.click(screen.getByRole("button", { name: /add/i }));

      const modalEl = screen.getByRole("dialog", { name: /participant/i });

      expect(within(modalEl).queryByRole("checkbox")).not.toBeInTheDocument();
      expect(
        within(modalEl).getByText(
          GroupContainer.getNoAvailableParticipantWarningMessage()
        )
      ).toBeInTheDocument();
      expect(
        within(modalEl).getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
      expect(
        within(modalEl).getByRole("button", { name: /add/i })
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

      const modalEl = screen.getByRole("dialog", { name: /participants/i });

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
      const orphanedParticipant = createDummyParticipant();
      const fosteredParticipant = createDummyParticipant(true);
      const participants = [orphanedParticipant, fosteredParticipant];

      render(
        <GroupContainer
          ownedIndex={0}
          groups={groups}
          participants={participants}
        />
      );

      userEvent.click(screen.getByRole("button", { name: /details/i }));
      userEvent.click(screen.getByRole("button", { name: /add/i }));

      const modalEl = screen.getByRole("dialog", { name: /participants/i });

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

      userEvent.click(screen.getByRole("button", { name: /details/i }));
      userEvent.click(screen.getByRole("button", { name: /add/i }));

      const modalEl = screen.getByRole("dialog", { name: /participant/i });

      expect(
        within(modalEl).getByRole("button", { name: /add/i })
      ).toBeDisabled();
    });
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
