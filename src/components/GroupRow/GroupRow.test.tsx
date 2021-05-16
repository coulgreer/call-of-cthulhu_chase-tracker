import React from "react";

import { screen, render, within } from "@testing-library/react";
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
      distancerId: GroupRow.INVALID_DISTANCER_ID,
      pursuersIds: [],
      participants: [],
    },
    {
      id: "1",
      name: distancingGroupName,
      distancerId: GroupRow.INVALID_DISTANCER_ID,
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

    render(<GroupRow ownedIndex={isolatedGroupIndex} groups={groups} />);

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
      screen.queryByRole("heading", { name: /pursuer\(s\)/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /members/i })
    ).not.toBeInTheDocument();
  });

  describe("when expanded", () => {
    test("should render properly when ommitting all optional props", () => {
      const { groups } = DEFAULT_PROPS;

      render(<GroupRow ownedIndex={isolatedGroupIndex} groups={groups} />);
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
      expect(
        screen.getByText(GroupRow.NO_DISTANCER_WARNING_MESSAGE)
      ).toBeInTheDocument();

      expect(
        screen.getByRole("heading", { name: /pursuer\(s\)/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(GroupRow.NO_PURSUER_WARNING_MESSAGE)
      ).toBeInTheDocument();

      expect(
        screen.getByRole("heading", { name: /members/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(GroupRow.NO_MEMBER_WARNING_MESSAGE)
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
        <GroupRow
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

      userEvent.click(screen.getByRole("combobox", { name: /distancer/i }));

      expect(
        screen.getByRole("heading", { name: /pursuer\(s\)/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(GroupRow.NO_PURSUER_WARNING_MESSAGE)
      ).toBeInTheDocument();

      expect(
        screen.getByRole("heading", { name: /members/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(GroupRow.NO_MEMBER_WARNING_MESSAGE)
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    });

    describe("Participants", () => {
      test("should enable add button when 'participants' has at least one element", () => {
        const { groups, participants } = DEFAULT_PROPS;

        render(
          <GroupRow
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
          <GroupRow
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

describe("Member Display", () => {
  describe("Boundary Movement Ratings", () => {
    test("should render members properly when none exist on the group", () => {
      const { groups } = DEFAULT_PROPS;

      render(<GroupRow ownedIndex={isolatedGroupIndex} groups={groups} />);
      userEvent.click(screen.getByRole("button", { name: /group details/i }));

      expect(screen.getByText(/highest mov : N\/A/i)).toBeInTheDocument();
      expect(screen.getByText(/lowest mov : N\/A/i)).toBeInTheDocument();

      expect(
        screen.getByText(GroupRow.NO_MEMBER_WARNING_MESSAGE)
      ).toBeInTheDocument();

      expect(screen.queryByRole("list")).not.toBeInTheDocument();

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
          distancerId: GroupRow.INVALID_DISTANCER_ID,
          pursuersIds: [],
          participants,
        },
      ];

      const [firstParticipant] = participants;

      render(<GroupRow ownedIndex={0} groups={groups} />);
      userEvent.click(screen.getByRole("button", { name: /group details/i }));

      const listEl = screen.getByRole("list", { name: /members/i });

      expect(
        screen.getByText(
          new RegExp(`highest mov : ${firstParticipant.movementRate}`, "i")
        )
      ).not.toHaveClass(GroupRow.HIGHEST_MOVEMENT_CLASS_NAME);
      expect(
        screen.getByText(
          new RegExp(`lowest mov : ${firstParticipant.movementRate}`, "i")
        )
      ).not.toHaveClass(GroupRow.LOWEST_MOVEMENT_CLASS_NAME);
      expect(within(listEl).getByText(firstParticipant.name)).not.toHaveClass(
        GroupRow.HIGHEST_MOVEMENT_CLASS_NAME
      );
      expect(within(listEl).getByText(firstParticipant.name)).not.toHaveClass(
        GroupRow.LOWEST_MOVEMENT_CLASS_NAME
      );

      expect(within(listEl).getAllByRole("listitem")).toHaveLength(1);
    });

    test("should render properly when at least two participants exist with differing movement ratings", () => {
      const lowestMOV = 6;
      const highestMOV = 8;

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
          distancerId: GroupRow.INVALID_DISTANCER_ID,
          pursuersIds: [],
          participants,
        },
      ];

      render(<GroupRow ownedIndex={0} groups={groups} />);
      userEvent.click(screen.getByRole("button", { name: /group details/i }));

      const listEl = screen.getByRole("list", { name: /members/i });

      expect(
        screen.getByText(new RegExp(`highest mov : ${highestMOV}`, "i"))
      ).toHaveClass(GroupRow.HIGHEST_MOVEMENT_CLASS_NAME);
      expect(within(listEl).getByText(highestMovParticipant.name)).toHaveClass(
        GroupRow.HIGHEST_MOVEMENT_CLASS_NAME
      );

      expect(within(listEl).getByText(lowestMovParticipant.name)).toHaveClass(
        GroupRow.LOWEST_MOVEMENT_CLASS_NAME
      );
      expect(
        screen.getByText(new RegExp(`lowest mov : ${lowestMOV}`, "i"))
      ).toHaveClass(GroupRow.LOWEST_MOVEMENT_CLASS_NAME);

      expect(
        within(screen.getByRole("list", { name: /members/i })).getAllByRole(
          "listitem"
        )
      ).toHaveLength(participants.length);
    });
  });

  test("should trigger 'handleSubmit' and close modal", () => {
    const { groups, participants, handleSubmit } = DEFAULT_PROPS;

    const [first, second, third] = participants;

    render(
      <GroupRow
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
      <GroupRow
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
      <GroupRow
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
      screen.getByText(GroupRow.NO_AVAILABLE_PARTICIPANT_WARNING_MESSAGE)
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
        distancerId: GroupRow.INVALID_DISTANCER_ID,
        pursuersIds: [],
        participants: [participant2],
      },
    ];
    const participants = [participant1, participant2, participant3];

    render(
      <GroupRow ownedIndex={0} groups={groups} participants={participants} />
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
        distancerId: GroupRow.INVALID_DISTANCER_ID,
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
      <GroupRow ownedIndex={0} groups={groups} participants={participants} />
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
        distancerId: GroupRow.INVALID_DISTANCER_ID,
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
      <GroupRow ownedIndex={0} groups={groups} participants={participants} />
    );
    userEvent.click(screen.getByRole("button", { name: /group details/i }));

    userEvent.click(screen.getByRole("button", { name: /add/i }));

    const modalEl = screen.getByRole("dialog");
    expect(
      within(modalEl).getByRole("button", { name: /add/i })
    ).toBeDisabled();
  });
});

describe("Warnings", () => {
  describe("Distancer", () => {
    test("should show warning message when a group does not have a distancer", () => {
      const { groups } = DEFAULT_PROPS;

      render(<GroupRow ownedIndex={1} groups={groups} />);
      userEvent.click(screen.getByRole("button", { name: /group details/i }));

      expect(
        screen.getByText(GroupRow.NO_DISTANCER_WARNING_MESSAGE)
      ).toBeVisible();
    });

    test("should hide warning and display current distancer when a group has a distancer", () => {
      const { groups } = DEFAULT_PROPS;

      render(<GroupRow ownedIndex={centralGroupIndex} groups={groups} />);
      userEvent.click(screen.getByRole("button", { name: /group details/i }));

      expect(
        screen.getByText(GroupRow.NO_DISTANCER_WARNING_MESSAGE)
      ).not.toBeVisible();
    });
  });

  describe("Pursuer", () => {
    test("should show warning message when a group does not have at least one pursuer", () => {
      const { groups } = DEFAULT_PROPS;

      render(<GroupRow ownedIndex={3} groups={groups} />);
      userEvent.click(screen.getByRole("button", { name: /group details/i }));

      expect(
        screen.getByText(GroupRow.NO_PURSUER_WARNING_MESSAGE)
      ).toBeInTheDocument();
    });

    test("should hide warning and display current pursuer(s) when a group has any pursuers", () => {
      const { groups } = DEFAULT_PROPS;

      render(<GroupRow ownedIndex={centralGroupIndex} groups={groups} />);
      userEvent.click(screen.getByRole("button", { name: /group details/i }));

      expect(
        screen.queryByText(GroupRow.NO_PURSUER_WARNING_MESSAGE)
      ).not.toBeInTheDocument();

      expect(
        within(
          screen.getByRole("list", { name: /pursuer\(s\)/i })
        ).getAllByRole("listitem")
      ).toHaveLength(1);
    });
  });
});
