import * as React from "react";

import { screen, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GroupContainer from ".";
import ParticipantBuilder from "../../utils/participant-builder";
import GroupBuilder from "../../utils/group-builder";

import { Group, Participant } from "../../types";

function createDummyParticipant(isGrouped = false) {
  return new ParticipantBuilder().setGrouped(isGrouped).build();
}

function createDummyGroup() {
  return new GroupBuilder().build();
}

function createDummyGroupWithParticipants(participants: Participant[]) {
  return new GroupBuilder().withParticipants(participants).build();
}

const isolatedGroup = new GroupBuilder().withName("Group A").build();
const distancingGroup = new GroupBuilder()
  .withName("Group B")
  .withParticipants([createDummyParticipant(true)])
  .build();
const distancingAndPursuingGroup = new GroupBuilder()
  .withName("Group C")
  .withDistancer(distancingGroup)
  .withParticipants([
    createDummyParticipant(true),
    createDummyParticipant(true),
  ])
  .build();
const pursuingGroup = new GroupBuilder()
  .withName("Group D")
  .withDistancer(distancingAndPursuingGroup)
  .withParticipants([
    createDummyParticipant(true),
    createDummyParticipant(true),
    createDummyParticipant(true),
  ])
  .build();

distancingGroup.pursuers.push(distancingAndPursuingGroup);
distancingAndPursuingGroup.pursuers.push(pursuingGroup);

const DEFAULT_PROPS: {
  ownedIndex: number;
  groups: Group[];
  participants: Participant[];
  handleGroupChange: (g: Group) => void;
} = {
  ownedIndex: 0,
  groups: [
    isolatedGroup,
    distancingGroup,
    distancingAndPursuingGroup,
    pursuingGroup,
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

    const expandButton = screen.getByRole("button", { name: /group details/i });

    expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();
    expect(expandButton).toHaveAttribute("aria-expanded", "false");
    expect(expandButton).toHaveAttribute("aria-controls");
    expect(screen.getByText(/chase name/i)).not.toBeVisible();
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

      const expandButton = screen.getByRole("button", {
        name: /group details/i,
      });

      userEvent.click(expandButton);

      const alerts = screen.getAllByRole("alert");

      expect(expandButton).toHaveAttribute("aria-expanded", "true");
      expect(expandButton).toHaveAttribute("aria-controls");
      expect(
        screen.getByText((content, element) => {
          if (!element) return false;

          const hasText = (node: Element) => {
            if (node.textContent === null) return false;

            const regex = /chase name/i;

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
      expect(alerts[0]).toHaveTextContent(/no.*pursuers/i);
      expect(
        screen.getByRole("heading", { name: /members/i })
      ).toBeInTheDocument();
      expect(alerts[1]).toHaveTextContent(/no.*members/i);
      expect(screen.getByRole("button", { name: /add/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /remove/i })).toBeDisabled();
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

      const alerts = screen.getAllByRole("alert");

      expect(
        screen.getByRole("textbox", { name: /name/i })
      ).toBeInTheDocument();

      expect(
        screen.getByText((content, element) => {
          if (!element) return false;

          const hasText = (node: Element) => {
            if (node.textContent === null) return false;

            const regex = /chase name/i;

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
      expect(alerts[0]).toHaveTextContent(/no.*pursuers/i);

      expect(
        screen.getByRole("heading", { name: /members/i })
      ).toBeInTheDocument();
      expect(alerts[1]).toHaveTextContent(/no.*members/i);

      expect(screen.getByRole("button", { name: /add/i })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: /remove/i })).toBeDisabled();
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

      test("should enable remove button", () => {
        const participants = [
          createDummyParticipant(true),
          createDummyParticipant(true),
        ];
        const groups = [createDummyGroupWithParticipants(participants)];

        render(<GroupContainer ownedIndex={0} groups={groups} />);
        userEvent.click(screen.getByRole("button", { name: /group details/i }));

        expect(
          screen.getByRole("button", { name: /remove/i })
        ).not.toBeDisabled();
      });
    });
  });
});

describe("Group Name", () => {
  test("should keep aria-expand from changing", () => {
    const groups = [createDummyGroup()];

    render(<GroupContainer ownedIndex={0} groups={groups} />);

    const input = screen.getByRole("textbox", { name: /name/i });
    const accordion = screen.getByRole("button", { name: /group details/i });

    userEvent.click(input);

    expect(accordion).toHaveAttribute("aria-expanded", "false");
  });

  test("should change to prior, valid name", () => {
    const newGroupName = "Weyland Yutani";
    const groups = [createDummyGroup()];

    render(<GroupContainer ownedIndex={0} groups={groups} />);

    const input = screen.getByRole("textbox", { name: /name/i });

    userEvent.clear(input);
    userEvent.type(input, newGroupName);
    userEvent.clear(input);
    input.blur();

    expect(input).toHaveValue(newGroupName);
  });
});

describe("Distancer Display", () => {
  test("should show warning message and display placeholder distancer", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupContainer ownedIndex={1} groups={groups} />);
    userEvent.click(screen.getByRole("button", { name: /group details/i }));

    const distancerEl = screen.getByRole("combobox", { name: /distancer/i });

    userEvent.selectOptions(distancerEl, "");
    distancerEl.blur();

    expect(screen.getByRole("alert")).toHaveTextContent(/no.*distancer/i);
  });

  test("should hide warning message and display current distancer", () => {
    const { groups } = DEFAULT_PROPS;

    render(
      <GroupContainer ownedIndex={centralizedGroupIndex} groups={groups} />
    );
    userEvent.click(screen.getByRole("button", { name: /group details/i }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("Pursuer Display", () => {
  test("should show warning messager", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupContainer ownedIndex={3} groups={groups} />);
    userEvent.click(screen.getByRole("button", { name: /group details/i }));

    expect(screen.getByText(/no.*pursuers/i)).toBeInTheDocument();
  });

  test("should hide warning and display pursuers", () => {
    const { groups } = DEFAULT_PROPS;

    render(
      <GroupContainer ownedIndex={centralizedGroupIndex} groups={groups} />
    );
    userEvent.click(screen.getByRole("button", { name: /group details/i }));

    expect(screen.queryByText(/no.*pursuers/i)).not.toBeInTheDocument();

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

      const table = screen.getByRole("table", { name: /members/i });
      const highestMovRow = within(table).getByRole("row", {
        name: /highest mov/i,
      });
      const lowestMovRow = within(table).getByRole("row", {
        name: /lowest mov/i,
      });

      expect(
        within(highestMovRow).getByRole("columnheader", {
          name: /arrow_upward/i,
        })
      ).toBeInTheDocument();
      expect(
        within(highestMovRow).getByRole("columnheader", { name: /---/i })
      ).toBeInTheDocument();
      expect(
        within(highestMovRow).getByRole("columnheader", { name: /N\/A/i })
      ).toBeInTheDocument();

      expect(
        within(lowestMovRow).getByRole("columnheader", {
          name: /arrow_downward/i,
        })
      ).toBeInTheDocument();
      expect(
        within(lowestMovRow).getByRole("columnheader", { name: /---/i })
      ).toBeInTheDocument();
      expect(
        within(lowestMovRow).getByRole("columnheader", { name: /N\/A/i })
      ).toBeInTheDocument();

      expect(
        within(table).getByRole("columnheader", { name: /icon/i })
      ).toBeInTheDocument();
      expect(
        within(table).getByRole("columnheader", { name: /name/i })
      ).toBeInTheDocument();
      expect(
        within(table).getByRole("columnheader", { name: /mov/i })
      ).toBeInTheDocument();
      expect(
        within(table).getByRole("cell", {
          name: /no.*members/i,
        })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /remove/i })).toBeDisabled();
    });

    test("should render properly when one participant exists in the group", () => {
      const participants = [createDummyParticipant()];
      const groups = [createDummyGroupWithParticipants(participants)];

      const [firstParticipant] = participants;

      render(<GroupContainer ownedIndex={0} groups={groups} />);

      userEvent.click(screen.getByRole("button", { name: /group details/i }));

      const table = screen.getByRole("table", { name: /members/i });
      const highestMovRow = within(table).getByRole("row", {
        name: /highest mov/i,
      });
      const lowestMovRow = within(table).getByRole("row", {
        name: /lowest mov/i,
      });
      const participantRow = within(table).getByRole("row", {
        name: firstParticipant.name,
      });

      expect(
        within(highestMovRow).getByRole("columnheader", {
          name: /arrow_upward/i,
        })
      ).toBeInTheDocument();
      expect(
        within(highestMovRow).getByRole("columnheader", {
          name: firstParticipant.name,
        })
      ).toBeInTheDocument();
      expect(
        within(highestMovRow).getByRole("columnheader", {
          name: `${firstParticipant.movementRate}`,
        })
      ).toBeInTheDocument();

      expect(
        within(lowestMovRow).getByRole("columnheader", {
          name: /arrow_downward/i,
        })
      ).toBeInTheDocument();
      expect(
        within(lowestMovRow).getByRole("columnheader", {
          name: firstParticipant.name,
        })
      ).toBeInTheDocument();
      expect(
        within(lowestMovRow).getByRole("columnheader", {
          name: `${firstParticipant.movementRate}`,
        })
      ).toBeInTheDocument();

      expect(
        within(table).getByRole("columnheader", { name: /icon/i })
      ).toBeInTheDocument();
      expect(
        within(table).getByRole("columnheader", { name: /name/i })
      ).toBeInTheDocument();
      expect(
        within(table).getByRole("columnheader", { name: /mov/i })
      ).toBeInTheDocument();

      expect(
        within(participantRow).getByRole("cell", { name: /warning/i })
      ).toBeVisible();
      expect(
        within(participantRow).getByRole("cell", {
          name: `${firstParticipant.movementRate}`,
        })
      ).toBeInTheDocument();
      expect(
        within(participantRow).getByRole("cell", {
          name: firstParticipant.name,
        })
      ).toBeInTheDocument();

      expect(within(table).getAllByRole("row")).toHaveLength(4);
    });

    test("should render properly when at least two participants exist with differing movement ratings", () => {
      const lowestMOV = 1;
      const highestMOV = 11;
      const participants = [
        new ParticipantBuilder()
          .withName("Participant 1")
          .withMovementRate(lowestMOV)
          .setGrouped(true)
          .build(),
        new ParticipantBuilder()
          .withName("Participant 2")
          .withMovementRate(highestMOV)
          .setGrouped(true)
          .build(),
      ];
      const [lowestMovParticipant, highestMovParticipant] = participants;
      const groups = [createDummyGroupWithParticipants(participants)];

      render(<GroupContainer ownedIndex={0} groups={groups} />);

      userEvent.click(screen.getByRole("button", { name: /group details/i }));

      const table = screen.getByRole("table", { name: /members/i });
      const highestMovRow = within(table).getByRole("row", {
        name: /highest mov/i,
      });
      const lowestMovRow = within(table).getByRole("row", {
        name: /lowest mov/i,
      });
      const highestMovParticipantRow = within(table).getByRole("row", {
        name: highestMovParticipant.name,
      });
      const lowestMovParticipantRow = within(table).getByRole("row", {
        name: lowestMovParticipant.name,
      });

      expect(
        within(highestMovRow).getByRole("columnheader", {
          name: /arrow_upward/i,
        })
      ).toBeInTheDocument();
      expect(
        within(highestMovRow).getByRole("columnheader", {
          name: highestMovParticipant.name,
        })
      ).toBeInTheDocument();
      expect(
        within(highestMovRow).getByRole("columnheader", {
          name: `${highestMovParticipant.movementRate}`,
        })
      ).toBeInTheDocument();

      expect(
        within(lowestMovRow).getByRole("columnheader", {
          name: /arrow_downward/i,
        })
      ).toBeInTheDocument();
      expect(
        within(lowestMovRow).getByRole("columnheader", {
          name: lowestMovParticipant.name,
        })
      ).toBeInTheDocument();
      expect(
        within(lowestMovRow).getByRole("columnheader", {
          name: `${lowestMovParticipant.movementRate}`,
        })
      ).toBeInTheDocument();

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
        within(highestMovParticipantRow).getByRole("cell", {
          name: /warning/i,
        })
      ).toBeVisible();
      expect(
        within(highestMovParticipantRow).getByRole("cell", {
          name: highestMovParticipant.name,
        })
      ).toBeInTheDocument();
      expect(
        within(highestMovParticipantRow).getByRole("cell", {
          name: `${highestMovParticipant.movementRate}`,
        })
      ).toBeInTheDocument();

      expect(
        within(lowestMovParticipantRow).getByRole("cell", {
          name: /warning/i,
        })
      ).toBeVisible();
      expect(
        within(lowestMovParticipantRow).getByRole("cell", {
          name: lowestMovParticipant.name,
        })
      ).toBeInTheDocument();
      expect(
        within(lowestMovParticipantRow).getByRole("cell", {
          name: `${lowestMovParticipant.movementRate}`,
        })
      ).toBeInTheDocument();
    });
  });

  describe("Member Addition Modal", () => {
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

      const modal = screen.getByRole("dialog", { name: /participant/i });

      expect(within(modal).queryByRole("checkbox")).not.toBeInTheDocument();
      expect(within(modal).getByText(/no.*participants/i)).toBeInTheDocument();
      expect(
        within(modal).getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
      expect(
        within(modal).getByRole("button", { name: /add/i })
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

  describe("Member Removal Modal", () => {
    test("should open modal", () => {
      const participants = [
        createDummyParticipant(true),
        createDummyParticipant(true),
      ];
      const groups = [createDummyGroupWithParticipants(participants)];

      render(<GroupContainer ownedIndex={0} groups={groups} />);

      userEvent.click(screen.getByRole("button", { name: /details/i }));
      userEvent.click(screen.getByRole("button", { name: /remove/i }));

      expect(
        screen.getByRole("dialog", { name: /remove/i })
      ).toBeInTheDocument();
    });

    test("should close modal when 'cancel' button is clicked", () => {
      const participants = [
        createDummyParticipant(true),
        createDummyParticipant(true),
      ];
      const groups = [createDummyGroupWithParticipants(participants)];

      render(<GroupContainer ownedIndex={0} groups={groups} />);

      userEvent.click(screen.getByRole("button", { name: /details/i }));
      userEvent.click(screen.getByRole("button", { name: /remove/i }));
      userEvent.click(screen.getByRole("button", { name: /cancel/i }));

      expect(
        screen.queryByRole("dialog", { name: /remove/i })
      ).not.toBeInTheDocument();
    });

    test("should close modal when 'esc' is pressed", () => {
      const participants = [
        createDummyParticipant(true),
        createDummyParticipant(true),
      ];
      const groups = [createDummyGroupWithParticipants(participants)];

      render(<GroupContainer ownedIndex={0} groups={groups} />);

      userEvent.click(screen.getByRole("button", { name: /details/i }));
      userEvent.click(screen.getByRole("button", { name: /remove/i }));
      userEvent.keyboard("{esc}");

      expect(
        screen.queryByRole("dialog", { name: /remove/i })
      ).not.toBeInTheDocument();
    });

    test("should trigger 'handleGroupChange' and close modal", () => {
      const handleGroupChange = jest.fn();
      const participants = [
        createDummyParticipant(true),
        createDummyParticipant(true),
      ];
      const groups = [createDummyGroupWithParticipants(participants)];

      render(
        <GroupContainer
          ownedIndex={0}
          groups={groups}
          onGroupChange={handleGroupChange}
        />
      );

      userEvent.click(screen.getByRole("button", { name: /details/i }));
      userEvent.click(screen.getByRole("button", { name: /remove/i }));

      const modalEl = screen.getByRole("dialog", { name: /remove/i });

      userEvent.click(within(modalEl).getByRole("button", { name: /remove/i }));

      expect(handleGroupChange).toBeCalledTimes(1);
      expect(modalEl).not.toBeInTheDocument();
    });

    test("should render modal properly", () => {
      const memberCount = 2;
      const participants = [
        createDummyParticipant(true),
        createDummyParticipant(true),
      ];
      const groups = [createDummyGroupWithParticipants(participants)];

      render(<GroupContainer ownedIndex={0} groups={groups} />);

      userEvent.click(screen.getByRole("button", { name: /details/i }));
      userEvent.click(screen.getByRole("button", { name: /remove/i }));

      const modalEl = screen.getByRole("dialog", { name: /remove/i });

      expect(
        within(modalEl).getByRole("heading", { name: /remove.*group/i })
      ).toBeInTheDocument();
      expect(within(modalEl).getAllByRole("checkbox")).toHaveLength(
        memberCount
      );
      expect(
        within(modalEl).getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
      expect(
        within(modalEl).getByRole("button", { name: /remove/i })
      ).toBeInTheDocument();
    });
  });
});

describe("Confirmation Tests", () => {
  test("should only show warning icon for members with boundary values", () => {
    const lowestMOV = 1;
    const highestMOV = 11;
    const middlingMOV = highestMOV - lowestMOV;

    const participants = [
      new ParticipantBuilder()
        .withName("Participant 1")
        .withMovementRate(lowestMOV)
        .setGrouped(true)
        .build(),
      new ParticipantBuilder()
        .withName("Participant 2")
        .withMovementRate(middlingMOV)
        .setGrouped(true)
        .build(),
      new ParticipantBuilder()
        .withName("Participant 3")
        .withMovementRate(highestMOV)
        .setGrouped(true)
        .build(),
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

  test("should add participant once when participants are reselected after initial canceling", () => {
    const participants = [createDummyParticipant(), createDummyParticipant()];
    const groups = [createDummyGroupWithParticipants([])];
    const [{ name: firstParticipant }, { name: secondParticipant }] =
      participants;
    const headerRowCount = 3;

    render(
      <GroupContainer
        groups={groups}
        ownedIndex={0}
        participants={participants}
      />
    );

    userEvent.click(screen.getByRole("button", { name: /details/i }));

    const tableEl = screen.getByRole("table", { name: /members/i });

    userEvent.click(screen.getByRole("button", { name: /add/i }));

    let modalEl = screen.getByRole("dialog", { name: /participants/i });

    userEvent.click(
      within(modalEl).getByRole("checkbox", {
        name: new RegExp(`${firstParticipant}`, "i"),
      })
    );
    userEvent.click(
      within(modalEl).getByRole("checkbox", {
        name: new RegExp(`${secondParticipant}`, "i"),
      })
    );
    userEvent.click(within(modalEl).getByRole("button", { name: /cancel/i }));
    userEvent.click(screen.getByRole("button", { name: /add/i }));

    modalEl = screen.getByRole("dialog", { name: /participants/i });

    userEvent.click(
      within(modalEl).getByRole("checkbox", {
        name: new RegExp(`${firstParticipant}`, "i"),
      })
    );
    userEvent.click(
      within(modalEl).getByRole("checkbox", {
        name: new RegExp(`${secondParticipant}`, "i"),
      })
    );
    userEvent.click(within(modalEl).getByRole("button", { name: /add/i }));

    expect(within(tableEl).getAllByRole("row")).toHaveLength(
      headerRowCount + participants.length
    );
  });
});
