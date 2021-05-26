import React from "react";

import { screen, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GroupContainer from ".";

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
    isGrouped: false,
  };
}

const isolatedGroupName = "Group 0";
const distancingGroupName = "Group 1";
const distancingAndPursuingGroupName = "Group 2";
const pursuingGroupName = "Group 3";

const DEFAULT_PROPS: {
  groups: Group[];
  participants: Participant[];
  handleDistancerBlur: () => void;
  handleSubmit: (g: Group) => void;
} = {
  groups: [
    {
      id: "0",
      name: isolatedGroupName,
      distancerId: GroupContainer.getInvalidDistancerId(),
      pursuersIds: [],
      participants: [],
    },
    {
      id: "1",
      name: distancingGroupName,
      distancerId: GroupContainer.getInvalidDistancerId(),
      pursuersIds: [distancingAndPursuingGroupName],
      participants: [createParticipant("Participant 00")],
    },
    {
      id: "2",
      name: distancingAndPursuingGroupName,
      distancerId: distancingGroupName,
      pursuersIds: [pursuingGroupName],
      participants: [
        createParticipant("Participant 01"),
        createParticipant("Participant 02"),
      ],
    },
    {
      id: "3",
      name: pursuingGroupName,
      distancerId: distancingAndPursuingGroupName,
      pursuersIds: [],
      participants: [
        createParticipant("Participant 03"),
        createParticipant("Participant 04"),
        createParticipant("Participant 05"),
      ],
    },
  ],
  participants: [
    {
      id: "p1",
      name: "Participant 1",
      dexterity: 15,
      movementRate: 3,
      derivedSpeed: 1,
      speedStatistics: [],
      hazardStatistics: [],
      isGrouped: false,
    },
    {
      id: "p2",
      name: "Participant 2",
      dexterity: 50,
      movementRate: 6,
      derivedSpeed: 2,
      speedStatistics: [],
      hazardStatistics: [],
      isGrouped: false,
    },
    {
      id: "p3",
      name: "Participant 3",
      dexterity: 75,
      movementRate: 8,
      derivedSpeed: 3,
      speedStatistics: [],
      hazardStatistics: [],
      isGrouped: false,
    },
  ],
  handleDistancerBlur: jest.fn(),
  handleSubmit: jest.fn(),
};

const isolatedGroupIndex = 0;
const centralGroupIndex = 2;

describe("Prop Rendering", () => {
  test("should render properly when collapsed", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupContainer ownedIndex={isolatedGroupIndex} groups={groups} />);

    expect(
      screen.getByRole("gridcell", {
        name: new RegExp(`${groups[isolatedGroupIndex].name}`, "i"),
      })
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /split/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /join/i })).toBeInTheDocument();
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
        screen.getByRole("gridcell", {
          name: new RegExp(`${groups[isolatedGroupIndex].name}`, "i"),
        })
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: /split/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /join/i })).toBeInTheDocument();

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
      const {
        groups,
        participants,
        handleDistancerBlur,
        handleSubmit,
      } = DEFAULT_PROPS;

      render(
        <GroupContainer
          ownedIndex={isolatedGroupIndex}
          groups={groups}
          participants={participants}
          onDistancerBlur={handleDistancerBlur}
          onSubmit={handleSubmit}
        />
      );
      userEvent.click(screen.getByRole("button", { name: /group details/i }));

      expect(
        screen.getByRole("gridcell", {
          name: new RegExp(`${groups[isolatedGroupIndex].name}`, "i"),
        })
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: /split/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /join/i })).toBeInTheDocument();

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

describe("Merging", () => {
  test("should open modal", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupContainer ownedIndex={isolatedGroupIndex} groups={groups} />);

    userEvent.click(screen.getByRole("button", { name: /join/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("should close modal when 'esc' is pressed", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupContainer ownedIndex={isolatedGroupIndex} groups={groups} />);
    userEvent.click(screen.getByRole("button", { name: /join/i }));

    userEvent.keyboard("{esc}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
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
      const participants: Participant[] = [
        {
          id: "p1",
          name: "Participant 1",
          dexterity: 15,
          movementRate: 6,
          derivedSpeed: 1,
          speedStatistics: [],
          hazardStatistics: [],
          isGrouped: false,
        },
      ];

      const groups: Group[] = [
        {
          id: "0",
          name: "Group 0",
          distancerId: GroupContainer.getInvalidDistancerId(),
          pursuersIds: [],
          participants,
        },
      ];

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

      const participants: Participant[] = [
        {
          id: "p1",
          name: "Participant 1",
          dexterity: 15,
          movementRate: lowestMOV,
          derivedSpeed: 1,
          speedStatistics: [],
          hazardStatistics: [],
          isGrouped: false,
        },
        {
          id: "p2",
          name: "Participant 2",
          dexterity: 50,
          movementRate: highestMOV,
          derivedSpeed: 2,
          speedStatistics: [],
          hazardStatistics: [],
          isGrouped: false,
        },
      ];

      const [lowestMovParticipant, highestMovParticipant] = participants;

      const groups: Group[] = [
        {
          id: "0",
          name: "Group 0",
          distancerId: GroupContainer.getInvalidDistancerId(),
          pursuersIds: [],
          participants,
        },
      ];

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

  test("should trigger 'handleSubmit' and close modal", () => {
    const { groups, participants, handleSubmit } = DEFAULT_PROPS;

    const [first, second, third] = participants;

    render(
      <GroupContainer
        ownedIndex={isolatedGroupIndex}
        groups={groups}
        participants={participants}
        onSubmit={handleSubmit}
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
    expect(handleSubmit).toBeCalled();
  });

  test("should update participant's flag for representing group ownership", () => {
    const { groups, handleSubmit } = DEFAULT_PROPS;

    const participants: Participant[] = [
      createParticipant("Part 1"),
      createParticipant("Part 2"),
    ];
    const [first] = participants;

    render(
      <GroupContainer
        ownedIndex={isolatedGroupIndex}
        groups={groups}
        participants={participants}
        onSubmit={handleSubmit}
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
    const participant = createParticipant("Part");
    const participants = [participant];

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
    const participant1Name = "Part 1";
    const participant1 = createParticipant(participant1Name);

    const participant2Name = "Part 2";
    const participant2 = createParticipant(participant2Name);

    const participant3Name = "Part 3";
    const participant3 = createParticipant(participant3Name);

    const groups = [
      {
        id: "g-1",
        name: "Group 1",
        distancerId: GroupContainer.getInvalidDistancerId(),
        pursuersIds: [],
        participants: [participant2],
      },
    ];
    const participants = [participant1, participant2, participant3];

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
        name: new RegExp(participant1Name),
      })
    ).toBeInTheDocument();
    expect(
      within(modalEl).queryByRole("checkbox", {
        name: new RegExp(participant2Name),
      })
    ).not.toBeInTheDocument();
    expect(
      within(modalEl).getByRole("checkbox", {
        name: new RegExp(participant3Name),
      })
    ).toBeInTheDocument();
  });

  test("should exclude participants already owned by any other group", () => {
    const groups = [
      {
        id: "g-1",
        name: "Group 1",
        distancerId: GroupContainer.getInvalidDistancerId(),
        pursuersIds: [],
        participants: [],
      },
    ];

    const orphanedParticipant = {
      id: "P-0",
      name: "Orphaned",
      dexterity: 15,
      movementRate: 3,
      derivedSpeed: 1,
      speedStatistics: [],
      hazardStatistics: [],
      isGrouped: false,
    };
    const fosteredParticipant = {
      id: "P-1",
      name: "Fostered",
      dexterity: 15,
      movementRate: 3,
      derivedSpeed: 1,
      speedStatistics: [],
      hazardStatistics: [],
      isGrouped: true,
    };
    const participants: Participant[] = [
      orphanedParticipant,
      fosteredParticipant,
    ];

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
    const domesticParticipant: Participant = {
      id: "P-0",
      name: "Domestic",
      dexterity: 15,
      movementRate: 3,
      derivedSpeed: 1,
      speedStatistics: [],
      hazardStatistics: [],
      isGrouped: true,
    };

    const groups = [
      {
        id: "g-1",
        name: "Group 1",
        distancerId: GroupContainer.getInvalidDistancerId(),
        pursuersIds: [],
        participants: [domesticParticipant],
      },
    ];

    const foreignParticipant: Participant = {
      id: "P-1",
      name: "Foreign",
      dexterity: 15,
      movementRate: 3,
      derivedSpeed: 1,
      speedStatistics: [],
      hazardStatistics: [],
      isGrouped: true,
    };

    const participants: Participant[] = [
      domesticParticipant,
      foreignParticipant,
    ];

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

    const participants: Participant[] = [
      {
        id: "p1",
        name: "Participant 1",
        dexterity: 15,
        movementRate: lowestMOV,
        derivedSpeed: 1,
        speedStatistics: [],
        hazardStatistics: [],
        isGrouped: true,
      },
      {
        id: "p2",
        name: "Participant 2",
        dexterity: 15,
        movementRate: middlingMOV,
        derivedSpeed: 1,
        speedStatistics: [],
        hazardStatistics: [],
        isGrouped: true,
      },
      {
        id: "p3",
        name: "Participant 3",
        dexterity: 50,
        movementRate: highestMOV,
        derivedSpeed: 2,
        speedStatistics: [],
        hazardStatistics: [],
        isGrouped: true,
      },
    ];

    const [, middleParticipant] = participants;

    const groups: Group[] = [
      {
        id: "0",
        name: "Group 0",
        distancerId: GroupContainer.getInvalidDistancerId(),
        pursuersIds: [],
        participants,
      },
    ];

    render(<GroupContainer ownedIndex={0} groups={groups} />);
    userEvent.click(screen.getByRole("button", { name: /group details/i }));

    const rowEl = screen.getByRole("row", {
      name: middleParticipant.name,
    });

    expect(
      within(rowEl).queryByRole("cell", { name: /warning/i })
    ).not.toBeInTheDocument();
  });
});
