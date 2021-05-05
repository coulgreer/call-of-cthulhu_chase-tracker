import React from "react";

import { screen, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TabbedDisplay from ".";
import GroupTable from "../GroupTable";
import GroupRow from "../GroupRow";
import ParticipantTable from "../ParticipantTable";
import ParticipantRow from "../ParticipantRow";

function createAnExpandedGroupRow() {
  userEvent.click(screen.getByRole("tab", { name: /groups/i }));
  userEvent.click(screen.getByRole("button", { name: /create group/i }));

  const expandEls = screen.getAllByRole("button", { name: /group details/i });
  userEvent.click(expandEls[expandEls.length - 1]);
}

function createAnExpandedParticipantRow() {
  userEvent.click(screen.getByRole("tab", { name: /participants/i }));
  userEvent.click(screen.getByRole("button", { name: /add participant/i }));
  userEvent.click(screen.getByRole("button", { name: /expand/i }));
}

/*
 * TODO (Coul Greer): Ensure that any expected changes cause the new participant data to update the
 * associated particpant object. For example, name change, dexterity score change, hazard skill changes,
 * etc.
 */

test("should render properly", () => {
  render(<TabbedDisplay />);

  expect(screen.getByRole("tab", { name: /participants/i })).toHaveClass(
    "TabbedDisplay__tab--enabled"
  );
  expect(screen.getByRole("tab", { name: /groups/i })).toHaveClass(
    "TabbedDisplay__tab--disabled"
  );

  expect(screen.getByRole("tablist")).toBeInTheDocument();
  expect(screen.getByRole("tabpanel", { name: /participants/i })).toBeVisible();
  expect(
    screen.queryByRole("tabpanel", { name: /groups/i })
  ).not.toBeInTheDocument();
});

test("should switch displays when tab is clicked", () => {
  render(<TabbedDisplay />);

  userEvent.click(screen.getByRole("tab", { name: /groups/i }));

  expect(
    screen.queryByRole("tabpanel", { name: /participants/i })
  ).not.toBeInTheDocument();
  expect(screen.getByRole("tabpanel", { name: /groups/i })).toBeVisible();
});

describe("ParticipantTable Event Handlers", () => {
  test("should render properly when a participant is created", () => {
    render(<TabbedDisplay />);

    userEvent.click(screen.getByRole("tab", { name: /participants/i }));
    userEvent.click(screen.getByRole("button", { name: /add participant/i }));

    expect(
      screen.queryByText(ParticipantTable.DEFAULT_WARNING_MESSAGE)
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("grid", { name: /participant/i })
    ).toBeInTheDocument();
  });

  test("should delete pre-existing participant when its associated delete button is pressed", () => {
    render(<TabbedDisplay />);

    createAnExpandedParticipantRow();
    createAnExpandedParticipantRow();
    createAnExpandedParticipantRow();

    userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`remove: ${ParticipantTable.DEFAULT_NAME} #1`, "i"),
      })
    );
    userEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  describe("Skills", () => {
    const validInput = 11;

    describe("Naming Hazard Skill", () => {
      const [
        primaryStat,
        secondaryStat,
      ] = ParticipantRow.DEFAULT_HAZARD_STATISTICS;

      test("should reset textbox to current name when another hazard skill has been renamed", () => {
        const firstNewName = "First Name";

        render(<TabbedDisplay />);
        createAnExpandedParticipantRow();

        userEvent.click(
          screen.getByRole("button", {
            name: new RegExp(`rename: ${primaryStat.name}`),
          })
        );

        const renameInputEl = screen.getByRole("textbox", {
          name: /new name/i,
        });
        userEvent.clear(renameInputEl);
        userEvent.type(renameInputEl, firstNewName);
        userEvent.click(screen.getByRole("button", { name: /^rename$/i }));

        userEvent.click(
          screen.getByRole("button", {
            name: new RegExp(`rename: ${secondaryStat.name}`),
          })
        );

        expect(screen.getByRole("textbox", { name: /new name/i })).toHaveValue(
          secondaryStat.name
        );
      });

      test("should rename hazard statistic when given a new name", () => {
        const originName = primaryStat.name;
        const newName = "NEW_TEST";

        render(<TabbedDisplay />);
        createAnExpandedParticipantRow();

        expect(screen.queryByText(newName)).not.toBeInTheDocument();
        expect(screen.getByText(originName)).toBeInTheDocument();

        userEvent.click(
          screen.getByRole("button", {
            name: new RegExp(`rename: ${originName}`, "i"),
          })
        );

        const nameTextboxEl = screen.getByRole("textbox", {
          name: /new name/i,
        });
        userEvent.clear(nameTextboxEl);
        userEvent.type(nameTextboxEl, newName);

        userEvent.click(screen.getByRole("button", { name: /^rename$/i }));

        expect(screen.getByText(newName)).toBeInTheDocument();
        expect(screen.queryByText(originName)).not.toBeInTheDocument();
      });

      test("should change 'hazard statistic' to the last valid value when changed to an invalid value and focus lost", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantRow();

        const statisticDisplayEl = screen.getByRole("spinbutton", {
          name: primaryStat.name,
        });
        userEvent.clear(statisticDisplayEl);
        userEvent.type(statisticDisplayEl, validInput.toString());
        userEvent.clear(statisticDisplayEl);

        expect(statisticDisplayEl).toHaveDisplayValue("");
        expect(statisticDisplayEl).toHaveValue(null);

        statisticDisplayEl.blur();

        expect(statisticDisplayEl).toHaveDisplayValue(validInput.toString());
        expect(statisticDisplayEl).toHaveValue(validInput);
      });

      test("should create a hazard stat with the appropriate name when creating a new hazard stat", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantRow();

        userEvent.click(
          screen.getByRole("button", {
            name: new RegExp(`delete: ${primaryStat.name}`, "i"),
          })
        );
        userEvent.click(
          screen.getAllByRole("button", { name: /create statistic/i })[1]
        );

        expect(
          screen.getByLabelText(`${ParticipantRow.DEFAULT_STAT_NAME} #1`)
        ).toBeInTheDocument();
      });
    });

    describe("Naming Speed Skill", () => {
      const [
        primaryStat,
        secondaryStat,
      ] = ParticipantRow.DEFAULT_SPEED_STATISTICS;

      test("should reset textbox to current name when another speed skill has been renamed", () => {
        const firstNewName = "First Name";

        render(<TabbedDisplay />);
        createAnExpandedParticipantRow();

        userEvent.click(
          screen.getByRole("button", {
            name: new RegExp(`rename: ${primaryStat.name}`),
          })
        );

        const renameInputEl = screen.getByRole("textbox", {
          name: /new name/i,
        });
        userEvent.clear(renameInputEl);
        userEvent.type(renameInputEl, firstNewName);
        userEvent.click(screen.getByRole("button", { name: /^rename$/i }));

        userEvent.click(
          screen.getByRole("button", {
            name: new RegExp(`rename: ${secondaryStat.name}`),
          })
        );

        expect(screen.getByRole("textbox", { name: /new name/i })).toHaveValue(
          secondaryStat.name
        );
      });

      test("should rename speed statistic when given a new name", () => {
        const originName = primaryStat.name;
        const newName = "NEW_TEST";

        render(<TabbedDisplay />);
        createAnExpandedParticipantRow();

        expect(screen.queryByText(newName)).not.toBeInTheDocument();
        expect(screen.getByText(originName)).toBeInTheDocument();

        userEvent.click(
          screen.getByRole("button", {
            name: new RegExp(`rename: ${originName}`, "i"),
          })
        );

        const nameTextboxEl = screen.getByRole("textbox", {
          name: /new name/i,
        });
        userEvent.clear(nameTextboxEl);
        userEvent.type(nameTextboxEl, newName);

        userEvent.click(screen.getByRole("button", { name: /^rename$/i }));

        expect(screen.getByText(newName)).toBeInTheDocument();
        expect(screen.queryByText(originName)).not.toBeInTheDocument();
      });

      test("should change 'speed statistic' to the last valid value when changed to an invalid value and focus lost", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantRow();

        const statisticDisplayEl = screen.getByRole("spinbutton", {
          name: primaryStat.name,
        });
        userEvent.clear(statisticDisplayEl);
        userEvent.type(statisticDisplayEl, validInput.toString());
        userEvent.clear(statisticDisplayEl);

        expect(statisticDisplayEl).toHaveDisplayValue("");
        expect(statisticDisplayEl).toHaveValue(null);

        statisticDisplayEl.blur();

        expect(statisticDisplayEl).toHaveDisplayValue(validInput.toString());
        expect(statisticDisplayEl).toHaveValue(validInput);
      });

      test("should create a speed stat with the appropriate name when creating a new speed stat", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantRow();

        userEvent.click(
          screen.getByRole("button", {
            name: new RegExp(`delete: ${primaryStat.name}`, "i"),
          })
        );
        userEvent.click(
          screen.getAllByRole("button", { name: /create statistic/i })[0]
        );

        expect(
          screen.getByLabelText(`${ParticipantRow.DEFAULT_STAT_NAME} #1`)
        ).toBeInTheDocument();
      });
    });

    describe("Skill Manipulation", () => {
      test("should create hazard stat when 'create hazard statistic' clicked", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantRow();

        expect(screen.queryByLabelText(/new stat #8/i)).not.toBeInTheDocument();

        userEvent.click(
          screen.getAllByRole("button", { name: /create statistic/i })[1]
        );

        expect(screen.getByLabelText(/new stat #8/i)).toBeInTheDocument();
      });

      test("should delete given hazard stat when the 'delete hazard statistic' is clicked", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantRow();

        const [hazardStat] = ParticipantRow.DEFAULT_HAZARD_STATISTICS;
        const { name } = hazardStat;

        expect(screen.getByLabelText(name)).toBeInTheDocument();

        userEvent.click(
          screen.getByRole("button", {
            name: new RegExp(`delete: ${name}`, "i"),
          })
        );

        expect(screen.queryByLabelText(name)).not.toBeInTheDocument();
      });

      test("should create speed statistic when appropriate 'create statistic' button clicked", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantRow();

        expect(screen.queryByLabelText(/new stat #6/i)).not.toBeInTheDocument();

        userEvent.click(
          screen.getAllByRole("button", { name: /create statistic/i })[0]
        );

        expect(screen.getByLabelText(/new stat #6/i)).toBeInTheDocument();
      });

      test("should delete given speed stat when the 'delete speed stat' is clicked", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantRow();

        const [speedStat] = ParticipantRow.DEFAULT_SPEED_STATISTICS;
        const { name } = speedStat;

        expect(screen.getByLabelText(name)).toBeInTheDocument();

        userEvent.click(
          screen.getByRole("button", {
            name: new RegExp(`delete: ${name}`, "i"),
          })
        );

        expect(screen.queryByLabelText(name)).not.toBeInTheDocument();
      });
    });

    test("should have the appropriate default participant name when a participant has been removed", () => {
      render(<TabbedDisplay />);
      userEvent.click(screen.getByRole("tab", { name: /participants/i }));

      const addButton = screen.getByRole("button", {
        name: /add participant/i,
      });
      userEvent.click(addButton);
      userEvent.click(addButton);
      userEvent.click(addButton);
      userEvent.click(addButton);
      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`remove: ${ParticipantTable.DEFAULT_NAME} #2`, "i"),
        })
      );
      userEvent.click(screen.getByRole("button", { name: /delete/i }));
      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`remove: ${ParticipantTable.DEFAULT_NAME} #4`, "i"),
        })
      );
      userEvent.click(screen.getByRole("button", { name: /delete/i }));
      userEvent.click(addButton);

      expect(
        screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #1`)
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #2`)
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #3`)
      ).toBeInTheDocument();
      expect(
        screen.queryByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #4`)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #5`)
      ).not.toBeInTheDocument();
    });
  });

  describe("Confirmation Tests", () => {
    test("should properly remove and add back participants when their numbers would sort differently between numerical and alphabetical", () => {
      render(<TabbedDisplay />);
      userEvent.click(screen.getByRole("tab", { name: /participants/i }));

      const addButton = screen.getByRole("button", {
        name: /add participant/i,
      });

      // Create 10+ participants.
      userEvent.click(addButton);
      userEvent.click(addButton);
      userEvent.click(addButton);
      userEvent.click(addButton);
      userEvent.click(addButton);
      userEvent.click(addButton);
      userEvent.click(addButton);
      userEvent.click(addButton);
      userEvent.click(addButton);
      userEvent.click(addButton);

      // Remove a participant that's not at the end of the sequence.
      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`remove: ${ParticipantTable.DEFAULT_NAME} #1$`, "i"),
        })
      );
      userEvent.click(screen.getByRole("button", { name: /delete/i }));

      /* Then, remove another participant that starts with a differing digit
       *  from the first, but is not at the end of the sequence. */
      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`remove: ${ParticipantTable.DEFAULT_NAME} #3$`, "i"),
        })
      );
      userEvent.click(screen.getByRole("button", { name: /delete/i }));

      // Add the participants back.
      userEvent.click(addButton);
      userEvent.click(addButton);

      expect(
        screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #1`)
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #2`)
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #3`)
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #4`)
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #5`)
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #6`)
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #7`)
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #8`)
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #9`)
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #10`)
      ).toBeInTheDocument();
      expect(
        screen.queryByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #11`)
      ).not.toBeInTheDocument();
    });
  });
});

describe("GroupTable Event Handlers", () => {
  test("should render properly when a group is created", () => {
    render(<TabbedDisplay />);

    userEvent.click(screen.getByRole("tab", { name: /groups/i }));
    userEvent.click(screen.getByRole("button", { name: /create group/i }));

    expect(
      screen.queryByText(GroupTable.DEFAULT_WARNING_MESSAGE)
    ).not.toBeInTheDocument();
    expect(screen.getByRole("grid", { name: /groups/i })).toBeInTheDocument();
  });

  test("should update group when row adds at least one participant", () => {
    render(<TabbedDisplay />);
    createAnExpandedParticipantRow();
    createAnExpandedGroupRow();

    userEvent.click(screen.getByRole("tab", { name: /groups/i }));
    userEvent.click(screen.getByRole("button", { name: /add/i }));

    userEvent.click(screen.getByRole("checkbox"));
    userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: /add/i })
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  test("should delete pre-existing group when its associated delete button is pressed", () => {
    render(<TabbedDisplay />);
    createAnExpandedGroupRow();
    createAnExpandedGroupRow();
    createAnExpandedGroupRow();

    userEvent.click(
      screen.getByRole("button", {
        name: /delete group-2/i,
      })
    );

    userEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("should update pursuers list when another group makes it its distancer", () => {
    const name1 = "GROUP-1";
    const name2 = "GROUP-2";
    const name3 = "GROUP-3";

    render(<TabbedDisplay />);
    createAnExpandedGroupRow();
    createAnExpandedGroupRow();
    createAnExpandedGroupRow();

    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();

    const [firstRow, secondRow, thirdRow] = screen.getAllByRole("row");
    const firstDistancerEl = within(firstRow).getByRole("combobox", {
      name: /distancer/i,
    });
    const secondDistancerEl = within(secondRow).getByRole("combobox", {
      name: /distancer/i,
    });
    const thirdDistancerEl = within(thirdRow).getByRole("combobox", {
      name: /distancer/i,
    });

    userEvent.selectOptions(firstDistancerEl, name2);
    firstDistancerEl.blur();

    expect(firstDistancerEl).toHaveValue(name2);
    expect(
      within(secondRow)
        .getAllByRole("listitem")
        .filter((listitem) => listitem.textContent === name1)
    ).toHaveLength(1);

    userEvent.selectOptions(secondDistancerEl, name3);
    secondDistancerEl.blur();

    expect(secondDistancerEl).toHaveValue(name3);
    expect(
      within(thirdRow)
        .getAllByRole("listitem")
        .filter((listitem) => listitem.textContent === name2)
    ).toHaveLength(1);

    userEvent.selectOptions(thirdDistancerEl, name1);
    thirdDistancerEl.blur();

    expect(thirdDistancerEl).toHaveValue(name1);
    expect(
      within(firstRow)
        .getAllByRole("listitem")
        .filter((listitem) => listitem.textContent === name3)
    ).toHaveLength(1);

    /**
     * TODO (Coul Greer): Think about if this last assert is necessary for the test. Meaning: does
     * this improve confidence. If so, extract into another test for switching back and forth.
     */
    userEvent.selectOptions(firstDistancerEl, name3);
    firstDistancerEl.blur();

    expect(firstDistancerEl).toHaveValue(name3);
    expect(
      within(thirdRow)
        .getAllByRole("listitem")
        .filter((listitem) => listitem.textContent === name1)
    ).toHaveLength(1);
    expect(within(secondRow).queryByRole("listitem")).not.toBeInTheDocument();
  });

  describe("Confirmation tests", () => {
    test("should maintain state when tabbed display are switched", () => {
      render(<TabbedDisplay />);

      userEvent.click(screen.getByRole("tab", { name: /participant/i }));

      userEvent.click(screen.getByRole("button", { name: /add participant/i }));

      expect(screen.getByRole("grid")).toBeInTheDocument();

      userEvent.click(screen.getByRole("tab", { name: /group/i }));
      userEvent.click(screen.getByRole("tab", { name: /participant/i }));

      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    test("should render 'no distancer' warning when row is initially added", () => {
      render(<TabbedDisplay />);
      createAnExpandedGroupRow();

      expect(
        screen.getByText(GroupRow.NO_DISTANCER_WARNING_MESSAGE)
      ).toBeVisible();
    });
  });
});

describe("Confirmation Tests", () => {
  test("should update movement in both group and participant tables", () => {
    const newMov = 20;

    render(<TabbedDisplay />);
    createAnExpandedParticipantRow();
    createAnExpandedGroupRow();

    userEvent.click(screen.getByRole("tab", { name: /groups/i }));
    userEvent.click(screen.getByRole("button", { name: /add/i }));
    userEvent.click(screen.getByRole("checkbox"));
    userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: /add/i })
    );

    userEvent.click(screen.getByRole("tab", { name: /participants/i }));

    const movEl = screen.getByRole("spinbutton", { name: /mov/i });
    userEvent.clear(movEl);
    userEvent.type(movEl, newMov.toString());

    userEvent.click(screen.getByRole("tab", { name: /groups/i }));

    expect(
      screen.getByText(new RegExp(`lowest mov : ${newMov}`, "i"))
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`highest mov : ${newMov}`, "i"))
    ).toBeInTheDocument();
  });
});
