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
  userEvent.click(screen.getByRole("button", { name: /create participant/i }));

  const expandEls = screen.getAllByRole("button", {
    name: /participant details/i,
  });
  userEvent.click(expandEls[expandEls.length - 1]);
}

test("should render properly", () => {
  render(<TabbedDisplay />);

  expect(screen.getByRole("main")).toBeInTheDocument();

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

/*
  TODO (Coul Greer): Ensure that any expected changes cause the new
  participant data to update the associated particpant object. For example,
  name change, dexterity score change, hazard statistic changes, etc.
*/

describe("ParticipantTable Event Handlers", () => {
  test("should render properly when a participant is created", () => {
    render(<TabbedDisplay />);

    userEvent.click(screen.getByRole("tab", { name: /participants/i }));
    userEvent.click(
      screen.getByRole("button", { name: /create participant/i })
    );

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

  test("should have the appropriate default participant name when a participant has been removed", () => {
    render(<TabbedDisplay />);
    userEvent.click(screen.getByRole("tab", { name: /participants/i }));

    const createParticipantButton = screen.getByRole("button", {
      name: /create participant/i,
    });
    userEvent.click(createParticipantButton);
    userEvent.click(createParticipantButton);
    userEvent.click(createParticipantButton);
    userEvent.click(createParticipantButton);
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
    userEvent.click(createParticipantButton);

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

  describe("Statistics", () => {
    const validScore = 11;
    const invalidScore = "invalid";

    describe("Core Statistics", () => {
      describe("when changing to valid score", () => {
        test("should update dexterity score on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          const dexterityEl = screen.getByRole("spinbutton", { name: /dex/i });
          userEvent.clear(dexterityEl);
          userEvent.type(dexterityEl, validScore.toString());
          dexterityEl.blur();

          expect(dexterityEl).toHaveValue(validScore);
          expect(dexterityEl).toHaveDisplayValue(validScore.toString());
        });

        test("should update derived speed score on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          const speedEl = screen.getByRole("spinbutton", { name: /speed/i });
          userEvent.clear(speedEl);
          userEvent.type(speedEl, validScore.toString());
          speedEl.blur();

          expect(speedEl).toHaveValue(validScore);
          expect(speedEl).toHaveDisplayValue(validScore.toString());
        });

        test("should update movement rate score on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          const movementEl = screen.getByRole("spinbutton", { name: /mov/i });
          userEvent.clear(movementEl);
          userEvent.type(movementEl, validScore.toString());
          movementEl.blur();

          expect(movementEl).toHaveValue(validScore);
          expect(movementEl).toHaveDisplayValue(validScore.toString());
        });
      });

      describe("when changing to invalid score", () => {
        test("should revert to prior valid dexterity score on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          const dexterityEl = screen.getByRole("spinbutton", { name: /dex/i });
          userEvent.clear(dexterityEl);
          userEvent.type(dexterityEl, validScore.toString());

          userEvent.clear(dexterityEl);
          userEvent.type(dexterityEl, invalidScore);
          dexterityEl.blur();

          expect(dexterityEl).toHaveValue(validScore);
          expect(dexterityEl).toHaveDisplayValue(validScore.toString());
        });

        test("should revert to prior valid derived speed score on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          const speedEl = screen.getByRole("spinbutton", { name: /speed/i });
          userEvent.clear(speedEl);
          userEvent.type(speedEl, validScore.toString());

          userEvent.clear(speedEl);
          userEvent.type(speedEl, invalidScore);
          speedEl.blur();

          expect(speedEl).toHaveValue(validScore);
          expect(speedEl).toHaveDisplayValue(validScore.toString());
        });

        test("should revert to prior valid movement rate score on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          const movementEl = screen.getByRole("spinbutton", { name: /mov/i });
          userEvent.clear(movementEl);
          userEvent.type(movementEl, validScore.toString());

          userEvent.clear(movementEl);
          userEvent.type(movementEl, invalidScore);
          movementEl.blur();

          expect(movementEl).toHaveValue(validScore);
          expect(movementEl).toHaveDisplayValue(validScore.toString());
        });
      });

      describe("when leaving score blank", () => {
        test("should revert to prior valid dexterity score on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          const dexterityEl = screen.getByRole("spinbutton", { name: /dex/i });
          userEvent.clear(dexterityEl);
          userEvent.type(dexterityEl, validScore.toString());

          userEvent.clear(dexterityEl);
          dexterityEl.blur();

          expect(dexterityEl).toHaveValue(validScore);
          expect(dexterityEl).toHaveDisplayValue(validScore.toString());
        });

        test("should revert to prior valid derived speed score on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          const speedEl = screen.getByRole("spinbutton", { name: /speed/i });
          userEvent.clear(speedEl);
          userEvent.type(speedEl, validScore.toString());

          userEvent.clear(speedEl);
          speedEl.blur();

          expect(speedEl).toHaveValue(validScore);
          expect(speedEl).toHaveDisplayValue(validScore.toString());
        });

        test("should revert to prior valid movement rate score on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          const movementEl = screen.getByRole("spinbutton", { name: /mov/i });
          userEvent.clear(movementEl);
          userEvent.type(movementEl, validScore.toString());

          userEvent.clear(movementEl);
          movementEl.blur();

          expect(movementEl).toHaveValue(validScore);
          expect(movementEl).toHaveDisplayValue(validScore.toString());
        });
      });
    });

    describe("Peripheral Statistics", () => {
      const [
        firstHazardStatistic,
        secondHazardStatistic,
      ] = ParticipantRow.DEFAULT_HAZARD_STATISTICS;
      const [
        firstSpeedStatistic,
        secondSpeedStatistic,
      ] = ParticipantRow.DEFAULT_SPEED_STATISTICS;

      const validName = "Valid Name";
      const invalidName = "   ";

      describe("when changing to valid name", () => {
        test("should update hazard statistic on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          userEvent.click(
            screen.getByRole("button", {
              name: new RegExp(`rename: ${firstHazardStatistic.name}`, "i"),
            })
          );

          const nameTextboxEl = screen.getByRole("textbox", {
            name: /new name/i,
          });
          userEvent.clear(nameTextboxEl);
          userEvent.type(nameTextboxEl, validName);
          userEvent.click(screen.getByRole("button", { name: /^rename$/i }));

          expect(screen.getByLabelText(validName)).toBeInTheDocument();
        });

        test("should update speed statistic on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          userEvent.click(
            screen.getByRole("button", {
              name: new RegExp(`rename: ${firstSpeedStatistic.name}`, "i"),
            })
          );

          const nameTextboxEl = screen.getByRole("textbox", {
            name: /new name/i,
          });
          userEvent.clear(nameTextboxEl);
          userEvent.type(nameTextboxEl, validName);
          userEvent.click(screen.getByRole("button", { name: /^rename$/i }));

          expect(screen.getByLabelText(validName)).toBeInTheDocument();
        });
      });

      describe("when changing to invalid name", () => {
        test("should revert to prior valid hazard statistic on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          userEvent.click(
            screen.getByRole("button", {
              name: new RegExp(`rename: ${firstHazardStatistic.name}`, "i"),
            })
          );

          const nameTextboxEl = screen.getByRole("textbox", {
            name: /new name/i,
          });
          userEvent.clear(nameTextboxEl);
          userEvent.type(nameTextboxEl, validName);
          userEvent.clear(nameTextboxEl);
          userEvent.type(nameTextboxEl, invalidName);
          userEvent.click(screen.getByRole("button", { name: /^rename$/i }));

          expect(screen.getByLabelText(validName)).toBeInTheDocument();
        });

        test("should revert to prior valid speed statistic on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          userEvent.click(
            screen.getByRole("button", {
              name: new RegExp(`rename: ${firstSpeedStatistic.name}`, "i"),
            })
          );

          const nameTextboxEl = screen.getByRole("textbox", {
            name: /new name/i,
          });
          userEvent.clear(nameTextboxEl);
          userEvent.type(nameTextboxEl, validName);
          userEvent.clear(nameTextboxEl);
          userEvent.type(nameTextboxEl, invalidName);
          userEvent.click(screen.getByRole("button", { name: /^rename$/i }));

          expect(screen.getByLabelText(validName)).toBeInTheDocument();
        });
      });

      describe("when leaving name blank", () => {
        test("should revert to prior valid hazard statistic on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          userEvent.click(
            screen.getByRole("button", {
              name: new RegExp(`rename: ${firstHazardStatistic.name}`, "i"),
            })
          );

          const nameTextboxEl = screen.getByRole("textbox", {
            name: /new name/i,
          });
          userEvent.clear(nameTextboxEl);
          userEvent.type(nameTextboxEl, validName);
          userEvent.clear(nameTextboxEl);
          userEvent.click(screen.getByRole("button", { name: /^rename$/i }));

          expect(screen.getByLabelText(validName)).toBeInTheDocument();
        });

        test("should revert to prior valid speed statistic on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          userEvent.click(
            screen.getByRole("button", {
              name: new RegExp(`rename: ${firstSpeedStatistic.name}`, "i"),
            })
          );

          const nameTextboxEl = screen.getByRole("textbox", {
            name: /new name/i,
          });
          userEvent.clear(nameTextboxEl);
          userEvent.type(nameTextboxEl, validName);
          userEvent.clear(nameTextboxEl);
          userEvent.click(screen.getByRole("button", { name: /^rename$/i }));

          expect(screen.getByLabelText(validName)).toBeInTheDocument();
        });
      });

      describe("when renaming a second statistic", () => {
        test("should set renaming textbox to the associated hazard statistic's name", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          userEvent.click(
            screen.getByRole("button", {
              name: new RegExp(`rename: ${firstHazardStatistic.name}`),
            })
          );

          const renameInputEl = screen.getByRole("textbox", {
            name: /new name/i,
          });
          userEvent.clear(renameInputEl);
          userEvent.type(renameInputEl, validName);
          userEvent.click(screen.getByRole("button", { name: /^rename$/i }));

          userEvent.click(
            screen.getByRole("button", {
              name: new RegExp(`rename: ${secondHazardStatistic.name}`),
            })
          );

          expect(
            screen.getByRole("textbox", { name: /new name/i })
          ).toHaveValue(secondHazardStatistic.name);
        });

        test("should set renaming textbox to the associated speed statistics name", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          userEvent.click(
            screen.getByRole("button", {
              name: new RegExp(`rename: ${firstSpeedStatistic.name}`),
            })
          );

          const renameInputEl = screen.getByRole("textbox", {
            name: /new name/i,
          });
          userEvent.clear(renameInputEl);
          userEvent.type(renameInputEl, validName);
          userEvent.click(screen.getByRole("button", { name: /^rename$/i }));

          userEvent.click(
            screen.getByRole("button", {
              name: new RegExp(`rename: ${secondSpeedStatistic.name}`),
            })
          );

          expect(
            screen.getByRole("textbox", { name: /new name/i })
          ).toHaveValue(secondSpeedStatistic.name);
        });
      });

      describe("when changing to valid score", () => {
        test("should update hazard statistic on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          const statisticDisplayEl = screen.getByRole("spinbutton", {
            name: firstHazardStatistic.name,
          });
          userEvent.clear(statisticDisplayEl);
          userEvent.type(statisticDisplayEl, validScore.toString());
          statisticDisplayEl.blur();

          expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
          expect(statisticDisplayEl).toHaveValue(validScore);
        });

        test("should update speed statistic on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          const statisticDisplayEl = screen.getByRole("spinbutton", {
            name: firstSpeedStatistic.name,
          });
          userEvent.clear(statisticDisplayEl);
          userEvent.type(statisticDisplayEl, validScore.toString());
          statisticDisplayEl.blur();

          expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
          expect(statisticDisplayEl).toHaveValue(validScore);
        });
      });

      describe("when changing to invalid score", () => {
        test("should revert to prior valid hazard statistic on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          const statisticDisplayEl = screen.getByRole("spinbutton", {
            name: firstHazardStatistic.name,
          });
          userEvent.clear(statisticDisplayEl);
          userEvent.type(statisticDisplayEl, validScore.toString());
          userEvent.clear(statisticDisplayEl);
          statisticDisplayEl.blur();

          expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
          expect(statisticDisplayEl).toHaveValue(validScore);
        });

        test("should revert to prior valid speed statistic on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          const statisticDisplayEl = screen.getByRole("spinbutton", {
            name: firstSpeedStatistic.name,
          });
          userEvent.clear(statisticDisplayEl);
          userEvent.type(statisticDisplayEl, validScore.toString());
          userEvent.clear(statisticDisplayEl);
          statisticDisplayEl.blur();

          expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
          expect(statisticDisplayEl).toHaveValue(validScore);
        });
      });

      describe("when leaving score blank", () => {
        test("should revert to hazard statistic's prior valid score", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          const statisticDisplayEl = screen.getByRole("spinbutton", {
            name: firstHazardStatistic.name,
          });
          userEvent.clear(statisticDisplayEl);
          userEvent.type(statisticDisplayEl, validScore.toString());
          userEvent.clear(statisticDisplayEl);
          statisticDisplayEl.blur();

          expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
          expect(statisticDisplayEl).toHaveValue(validScore);
        });

        test("should revert to speed statistic's prior valid score", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          const statisticDisplayEl = screen.getByRole("spinbutton", {
            name: firstSpeedStatistic.name,
          });
          userEvent.clear(statisticDisplayEl);
          userEvent.type(statisticDisplayEl, validScore.toString());
          userEvent.clear(statisticDisplayEl);
          statisticDisplayEl.blur();

          expect(statisticDisplayEl).toHaveDisplayValue(validScore.toString());
          expect(statisticDisplayEl).toHaveValue(validScore);
        });
      });

      describe("when creating a new statistic", () => {
        test("should have hazard statistic with appropriate name", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          userEvent.click(
            screen.getByRole("button", {
              name: new RegExp(`delete: ${firstHazardStatistic.name}`, "i"),
            })
          );
          userEvent.click(
            screen.getAllByRole("button", { name: /create statistic/i })[1]
          );

          expect(
            screen.getByLabelText(`${ParticipantRow.DEFAULT_STAT_NAME} #1`)
          ).toBeInTheDocument();
        });

        test("should have speed statistic with appropriate name", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantRow();

          userEvent.click(
            screen.getByRole("button", {
              name: new RegExp(`delete: ${firstSpeedStatistic.name}`, "i"),
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
    });

    describe("Statistic Manipulation", () => {
      test("should create hazard stat when 'create hazard statistic' clicked", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantRow();

        expect(screen.queryByLabelText(/new stat #8/i)).not.toBeInTheDocument();

        userEvent.click(
          screen.getAllByRole("button", { name: /create statistic/i })[1]
        );

        expect(screen.getByLabelText(/^new stat #8$/i)).toBeInTheDocument();
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

        expect(screen.getByLabelText(/^new stat #6$/i)).toBeInTheDocument();
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
  });

  describe("Confirmation Tests", () => {
    test("should properly remove and add back participants when their numbers would sort differently between numerical and alphabetical", () => {
      render(<TabbedDisplay />);
      userEvent.click(screen.getByRole("tab", { name: /participants/i }));

      const createParticipantButton = screen.getByRole("button", {
        name: /create participant/i,
      });

      // Create 10+ participants.
      userEvent.click(createParticipantButton);
      userEvent.click(createParticipantButton);
      userEvent.click(createParticipantButton);
      userEvent.click(createParticipantButton);
      userEvent.click(createParticipantButton);
      userEvent.click(createParticipantButton);
      userEvent.click(createParticipantButton);
      userEvent.click(createParticipantButton);
      userEvent.click(createParticipantButton);
      userEvent.click(createParticipantButton);

      // Delete a participant that's not at the end of the sequence.
      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`remove: ${ParticipantTable.DEFAULT_NAME} #1$`, "i"),
        })
      );
      userEvent.click(screen.getByRole("button", { name: /delete/i }));

      /* Then, delete another participant that starts with a differing digit
       *  from the first, but is not at the end of the sequence. */
      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`remove: ${ParticipantTable.DEFAULT_NAME} #3$`, "i"),
        })
      );
      userEvent.click(screen.getByRole("button", { name: /delete/i }));

      // Replenish the participants.
      userEvent.click(createParticipantButton);
      userEvent.click(createParticipantButton);

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

  test("should update group when row adds at least one member", () => {
    render(<TabbedDisplay />);
    createAnExpandedParticipantRow();
    createAnExpandedGroupRow();

    userEvent.click(screen.getByRole("tab", { name: /groups/i }));
    userEvent.click(screen.getByRole("button", { name: /add/i }));

    userEvent.click(screen.getByRole("checkbox"));
    userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: /add/i })
    );

    const tableDataEl = screen.getByRole("rowgroup", { name: /members/i });
    expect(within(tableDataEl).getAllByRole("row")).toHaveLength(1);
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

    expect(screen.getAllByRole("row", { name: /group/i })).toHaveLength(2);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("should update pursuers list when another group makes it its distancer", () => {
    const id1 = "GROUP-1";
    const id2 = "GROUP-2";
    const id3 = "GROUP-3";

    render(<TabbedDisplay />);
    createAnExpandedGroupRow();
    createAnExpandedGroupRow();
    createAnExpandedGroupRow();

    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();

    const firstGroupEl = screen.getByRole("row", { name: id1 });
    const firstDistancerEl = within(firstGroupEl).getByRole("combobox", {
      name: /distancer/i,
    });

    const secondGroupEl = screen.getByRole("row", { name: id2 });
    const secondDistancerEl = within(secondGroupEl).getByRole("combobox", {
      name: /distancer/i,
    });

    const thirdGroupEl = screen.getByRole("row", { name: id3 });
    const thirdDistancerEl = within(thirdGroupEl).getByRole("combobox", {
      name: /distancer/i,
    });

    userEvent.selectOptions(firstDistancerEl, id2);
    firstDistancerEl.blur();

    expect(firstDistancerEl).toHaveValue(id2);
    expect(
      within(secondGroupEl)
        .getAllByRole("listitem")
        .filter((listitem) => listitem.textContent === id1)
    ).toHaveLength(1);

    userEvent.selectOptions(secondDistancerEl, id3);
    secondDistancerEl.blur();

    expect(secondDistancerEl).toHaveValue(id3);
    expect(
      within(thirdGroupEl)
        .getAllByRole("listitem")
        .filter((listitem) => listitem.textContent === id2)
    ).toHaveLength(1);

    userEvent.selectOptions(thirdDistancerEl, id1);
    thirdDistancerEl.blur();

    expect(thirdDistancerEl).toHaveValue(id1);
    expect(
      within(firstGroupEl)
        .getAllByRole("listitem")
        .filter((listitem) => listitem.textContent === id3)
    ).toHaveLength(1);

    /*
      TODO (Coul Greer): Think about if this last assert is necessary for the
      test. Meaning: does this improve confidence. If so, extract into another
      test for switching back and forth.
    */
    userEvent.selectOptions(firstDistancerEl, id3);
    firstDistancerEl.blur();

    expect(firstDistancerEl).toHaveValue(id3);
    expect(
      within(thirdGroupEl)
        .getAllByRole("listitem")
        .filter((listitem) => listitem.textContent === id1)
    ).toHaveLength(1);
    expect(
      within(secondGroupEl).queryByRole("listitem")
    ).not.toBeInTheDocument();
  });

  describe("Confirmation tests", () => {
    test("should maintain state when tabbed display are switched", () => {
      render(<TabbedDisplay />);

      userEvent.click(screen.getByRole("tab", { name: /participant/i }));

      userEvent.click(
        screen.getByRole("button", { name: /create participant/i })
      );

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

    test("should not crash when changing distancer to 'none'", () => {
      render(<TabbedDisplay />);
      userEvent.click(screen.getByRole("tab", { name: /group/i }));
      userEvent.click(screen.getByRole("button", { name: /create group/i }));
      userEvent.click(screen.getByRole("button", { name: /group details/i }));

      expect(() =>
        userEvent.selectOptions(
          screen.getByRole("combobox", { name: /distancer/i }),
          GroupRow.INVALID_DISTANCER_ID
        )
      ).not.toThrowError();
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

    const lowestMovRow = screen.getByRole("row", {
      name: /member with the lowest mov/i,
    });
    expect(
      within(lowestMovRow).getByRole("cell", { name: `${newMov}` })
    ).toBeInTheDocument();

    const highestMovRow = screen.getByRole("row", {
      name: /member with the highest mov/i,
    });
    expect(
      within(highestMovRow).getByRole("cell", { name: `${newMov}` })
    ).toBeInTheDocument();
  });
});
