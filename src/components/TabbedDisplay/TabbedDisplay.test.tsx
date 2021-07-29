import React from "react";

import { screen, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TabbedDisplay from ".";
import GroupTable from "../GroupTable";
import GroupContainer from "../GroupContainer";
import ParticipantTable from "../ParticipantTable";
import ParticipantContainer from "../ParticipantContainer";

function createAnExpandedGroupContainer() {
  userEvent.click(screen.getByRole("tab", { name: /groups/i }));
  userEvent.click(screen.getByRole("button", { name: /create group/i }));

  const expandEls = screen.getAllByRole("button", { name: /group details/i });
  userEvent.click(expandEls[expandEls.length - 1]);
}

function createAnExpandedParticipantContainer() {
  userEvent.click(screen.getByRole("tab", { name: /participants/i }));
  userEvent.click(screen.getByRole("button", { name: /create participant/i }));

  const expandEls = screen.getAllByRole("button", {
    name: /participant details/i,
  });
  userEvent.click(expandEls[expandEls.length - 1]);
}

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

    createAnExpandedParticipantContainer();
    createAnExpandedParticipantContainer();
    createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

          const dexterityEl = screen.getByRole("spinbutton", { name: /dex/i });
          userEvent.clear(dexterityEl);
          userEvent.type(dexterityEl, validScore.toString());
          dexterityEl.blur();

          expect(dexterityEl).toHaveValue(validScore);
          expect(dexterityEl).toHaveDisplayValue(validScore.toString());
        });

        test("should update derived speed score on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantContainer();

          const speedEl = screen.getByRole("spinbutton", { name: /speed/i });
          userEvent.clear(speedEl);
          userEvent.type(speedEl, validScore.toString());
          speedEl.blur();

          expect(speedEl).toHaveValue(validScore);
          expect(speedEl).toHaveDisplayValue(validScore.toString());
        });

        test("should update movement rate score on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

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
      const [firstHazardStatistic, secondHazardStatistic] =
        ParticipantContainer.DEFAULT_HAZARD_STATISTICS;
      const [firstSpeedStatistic, secondSpeedStatistic] =
        ParticipantContainer.DEFAULT_SPEED_STATISTICS;

      const validName = "Valid Name";
      const invalidName = "   ";

      describe("when changing to valid name", () => {
        test("should update hazard statistic on participant", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

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
          createAnExpandedParticipantContainer();

          userEvent.click(
            screen.getByRole("button", {
              name: new RegExp(`delete: ${firstHazardStatistic.name}`, "i"),
            })
          );
          userEvent.click(
            screen.getAllByRole("button", { name: /create statistic/i })[1]
          );

          expect(
            screen.getByLabelText(
              `${ParticipantContainer.DEFAULT_STAT_NAME} #1`
            )
          ).toBeInTheDocument();
        });

        test("should have speed statistic with appropriate name", () => {
          render(<TabbedDisplay />);
          createAnExpandedParticipantContainer();

          userEvent.click(
            screen.getByRole("button", {
              name: new RegExp(`delete: ${firstSpeedStatistic.name}`, "i"),
            })
          );
          userEvent.click(
            screen.getAllByRole("button", { name: /create statistic/i })[0]
          );

          expect(
            screen.getByLabelText(
              `${ParticipantContainer.DEFAULT_STAT_NAME} #1`
            )
          ).toBeInTheDocument();
        });
      });
    });

    describe("Statistic Manipulation", () => {
      test("should create hazard stat when 'create hazard statistic' clicked", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        expect(screen.queryByLabelText(/new stat #8/i)).not.toBeInTheDocument();

        userEvent.click(
          screen.getAllByRole("button", { name: /create statistic/i })[1]
        );

        expect(screen.getByLabelText(/^new stat #8$/i)).toBeInTheDocument();
      });

      test("should delete given hazard stat when the 'delete hazard statistic' is clicked", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        const [hazardStat] = ParticipantContainer.DEFAULT_HAZARD_STATISTICS;
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
        createAnExpandedParticipantContainer();

        expect(screen.queryByLabelText(/new stat #6/i)).not.toBeInTheDocument();

        userEvent.click(
          screen.getAllByRole("button", { name: /create statistic/i })[0]
        );

        expect(screen.getByLabelText(/^new stat #6$/i)).toBeInTheDocument();
      });

      test("should delete given speed stat when the 'delete speed stat' is clicked", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        const [speedStat] = ParticipantContainer.DEFAULT_SPEED_STATISTICS;
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
  const tableHeadRowCount = 3;

  test("should render properly when a group is created", () => {
    render(<TabbedDisplay />);

    userEvent.click(screen.getByRole("tab", { name: /groups/i }));
    userEvent.click(screen.getByRole("button", { name: /create group/i }));

    expect(
      screen.queryByText(GroupTable.getDefaultWarningMessage())
    ).not.toBeInTheDocument();
    expect(screen.getByRole("grid", { name: /groups/i })).toBeInTheDocument();
  });

  test("should update group when row adds at least one member", () => {
    render(<TabbedDisplay />);
    createAnExpandedParticipantContainer();
    createAnExpandedGroupContainer();

    const groupCount = 1;

    userEvent.click(screen.getByRole("tab", { name: /groups/i }));

    const gridEl = screen.getByRole("grid", { name: /groups/i });

    userEvent.click(within(gridEl).getByRole("button", { name: /add/i }));

    const modalEl = screen.getByRole("dialog", { name: /participant/i });

    userEvent.click(within(modalEl).getByRole("checkbox"));
    userEvent.click(within(modalEl).getByRole("button", { name: /add/i }));

    const tableEl = screen.getByRole("table", { name: /members/i });

    expect(within(tableEl).getAllByRole("row")).toHaveLength(
      tableHeadRowCount + groupCount
    );
  });

  test("should delete pre-existing group when its associated delete button is pressed", () => {
    render(<TabbedDisplay />);
    createAnExpandedGroupContainer();
    createAnExpandedGroupContainer();
    createAnExpandedGroupContainer();

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
    const [firstGroupId, secondGroupId, thirdGroupId] = [
      "GROUP-1",
      "GROUP-2",
      "GROUP-3",
    ];

    render(<TabbedDisplay />);
    createAnExpandedGroupContainer();
    createAnExpandedGroupContainer();
    createAnExpandedGroupContainer();

    const gridEl = screen.getByRole("grid", { name: /groups/i });
    const firstGroupEditor = within(gridEl).getByRole("gridcell", {
      name: /1.*editor/i,
    });
    const firstDistancerEl = within(firstGroupEditor).getByRole("combobox", {
      name: /distancer/i,
    });
    const secondGroupEditor = within(gridEl).getByRole("gridcell", {
      name: /2.*editor/i,
    });
    const secondDistancerEl = within(secondGroupEditor).getByRole("combobox", {
      name: /distancer/i,
    });
    const thirdGroupEditor = within(gridEl).getByRole("gridcell", {
      name: /3.*editor/i,
    });
    const thirdDistancerEl = within(thirdGroupEditor).getByRole("combobox", {
      name: /distancer/i,
    });

    userEvent.selectOptions(firstDistancerEl, secondGroupId);
    userEvent.selectOptions(secondDistancerEl, thirdGroupId);
    userEvent.selectOptions(thirdDistancerEl, firstGroupId);
    thirdDistancerEl.blur();

    expect(firstDistancerEl).toHaveValue(secondGroupId);
    expect(
      within(secondGroupEditor)
        .getAllByRole("listitem")
        .filter((listitem) => listitem.textContent === firstGroupId)
    ).toHaveLength(1);
    expect(secondDistancerEl).toHaveValue(thirdGroupId);
    expect(
      within(thirdGroupEditor)
        .getAllByRole("listitem")
        .filter((listitem) => listitem.textContent === secondGroupId)
    ).toHaveLength(1);
    expect(thirdDistancerEl).toHaveValue(firstGroupId);
    expect(
      within(firstGroupEditor)
        .getAllByRole("listitem")
        .filter((listitem) => listitem.textContent === thirdGroupId)
    ).toHaveLength(1);
  });

  test("should combine groups", () => {
    render(<TabbedDisplay />);
    createAnExpandedGroupContainer();
    createAnExpandedGroupContainer();
    createAnExpandedGroupContainer();
    createAnExpandedGroupContainer();

    const gridEl = screen.getByRole("grid", { name: /groups/i });
    const editorEl = within(gridEl).getByRole("gridcell", {
      name: /group 1 editor/i,
    });

    userEvent.click(within(editorEl).getByRole("button", { name: /combine/i }));

    const modalEl = screen.getByRole("dialog", { name: /combine/i });

    userEvent.click(
      within(modalEl).getByRole("checkbox", { name: /group 2/i })
    );
    userEvent.click(
      within(modalEl).getByRole("checkbox", { name: /group 3/i })
    );
    userEvent.click(within(modalEl).getByRole("button", { name: /combine/i }));

    const tableEl = within(editorEl).getByRole("table", { name: /members/i });

    expect(within(tableEl).getAllByRole("row")).toHaveLength(4);
  });

  test("should rename group", () => {
    const newGroupName = "Newly Merged Group";

    render(<TabbedDisplay />);
    createAnExpandedGroupContainer();
    createAnExpandedGroupContainer();

    const editorEl = screen.getByRole("gridcell", {
      name: /group 1 editor/i,
    });

    userEvent.click(within(editorEl).getByRole("button", { name: /combine/i }));

    const modalEl = screen.getByRole("dialog");
    const newNameEl = within(modalEl).getByRole("textbox", { name: /name/i });

    userEvent.click(
      within(modalEl).getByRole("checkbox", { name: /group 2/i })
    );
    userEvent.clear(newNameEl);
    userEvent.type(newNameEl, newGroupName);
    userEvent.click(within(modalEl).getByRole("button", { name: /combine/i }));

    expect(
      within(editorEl).getByRole("textbox", { name: /name/i })
    ).toHaveDisplayValue(newGroupName);
  });

  test("should revert empty new name", () => {
    const validName = "Valid";

    render(<TabbedDisplay />);
    createAnExpandedGroupContainer();
    createAnExpandedGroupContainer();

    const editorEl = screen.getByRole("gridcell", {
      name: /group 1 editor/i,
    });

    userEvent.click(within(editorEl).getByRole("button", { name: /combine/i }));

    const modalEl = screen.getByRole("dialog");
    const newNameEl = within(modalEl).getByRole("textbox", { name: /name/i });

    userEvent.click(
      within(modalEl).getByRole("checkbox", { name: /group 2/i })
    );
    userEvent.clear(newNameEl);
    userEvent.type(newNameEl, validName);
    userEvent.clear(newNameEl);
    userEvent.click(within(modalEl).getByRole("button", { name: /combine/i }));

    expect(
      within(editorEl).getByRole("textbox", { name: /name/i })
    ).toHaveValue(validName);
  });

  test("should split group", () => {
    const newName = "A Cool Group";

    render(<TabbedDisplay />);

    createAnExpandedParticipantContainer();
    createAnExpandedParticipantContainer();
    createAnExpandedParticipantContainer();

    const [firstMemberId, secondMemberId, thirdMemberId] = [
      "Participant #1",
      "Participant #2",
      "Participant #3",
    ];

    createAnExpandedGroupContainer();

    userEvent.click(screen.getByRole("tab", { name: /groups/i }));
    userEvent.click(screen.getByRole("button", { name: /add/i }));

    const groupGridEl = screen.getByRole("grid", { name: /groups/i });
    const addMemberModal = screen.getByRole("dialog", {
      name: /select participant/i,
    });

    userEvent.click(
      within(addMemberModal).getByRole("checkbox", { name: firstMemberId })
    );
    userEvent.click(
      within(addMemberModal).getByRole("checkbox", { name: secondMemberId })
    );
    userEvent.click(
      within(addMemberModal).getByRole("checkbox", { name: thirdMemberId })
    );
    userEvent.click(
      within(addMemberModal).getByRole("button", { name: /add/i })
    );

    userEvent.click(
      within(groupGridEl).getByRole("button", { name: /split/i })
    );

    const splitGroupModal = screen.getByRole("dialog", {
      name: /transfer members/i,
    });
    const firstMemberRow = within(splitGroupModal).getByRole("row", {
      name: firstMemberId,
    });
    let secondMemberRow = within(splitGroupModal).getByRole("row", {
      name: secondMemberId,
    });

    userEvent.click(within(firstMemberRow).getByRole("button"));
    userEvent.click(within(secondMemberRow).getByRole("button"));

    secondMemberRow = within(splitGroupModal).getByRole("row", {
      name: secondMemberId,
    });

    userEvent.click(within(secondMemberRow).getByRole("button"));

    const nameTextbox = within(splitGroupModal).getByRole("textbox", {
      name: /new group name/i,
    });

    userEvent.clear(nameTextbox);
    userEvent.type(nameTextbox, newName);
    userEvent.click(
      within(splitGroupModal).getByRole("button", { name: /split/i })
    );

    const originalGroupEl = within(groupGridEl).getByRole("gridcell", {
      name: /group 1/i,
    });
    const splinteredGroupEl = within(groupGridEl).getByRole("gridcell", {
      name: new RegExp(newName),
    });
    const originalMembersTable = within(originalGroupEl).getByRole("table", {
      name: /members/i,
    });
    const expandEls = screen.getAllByRole("button", { name: /group details/i });

    userEvent.click(expandEls[expandEls.length - 1]);

    const splinteredMembersTable = within(splinteredGroupEl).getByRole(
      "table",
      { name: /members/i }
    );

    expect(
      within(splinteredMembersTable).getByRole("row", { name: firstMemberId })
    ).toBeInTheDocument();
    expect(
      within(originalMembersTable).getByRole("row", { name: secondMemberId })
    ).toBeInTheDocument();
    expect(
      within(originalMembersTable).getByRole("row", { name: thirdMemberId })
    ).toBeInTheDocument();
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

    test("should not crash when changing distancer to 'none'", () => {
      render(<TabbedDisplay />);
      userEvent.click(screen.getByRole("tab", { name: /group/i }));
      userEvent.click(screen.getByRole("button", { name: /create group/i }));
      userEvent.click(screen.getByRole("button", { name: /group details/i }));

      expect(() =>
        userEvent.selectOptions(
          screen.getByRole("combobox", { name: /distancer/i }),
          GroupContainer.getInvalidGroupId()
        )
      ).not.toThrowError();
    });
  });
});

describe("Confirmation Tests", () => {
  test("should update movement in both group and participant tables", () => {
    const newMov = 20;

    render(<TabbedDisplay />);
    createAnExpandedParticipantContainer();
    createAnExpandedGroupContainer();

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

  test("should combine groups when combining groups on more than one separate occassion", () => {
    render(<TabbedDisplay />);

    createAnExpandedGroupContainer();
    createAnExpandedGroupContainer();
    createAnExpandedGroupContainer();

    const gridEl = screen.getByRole("grid", { name: /groups/i });
    const [firstCell, secondCell, lastCell] = within(gridEl).getAllByRole(
      "gridcell",
      { name: /editor/i }
    );

    userEvent.click(
      within(firstCell).getByRole("button", { name: /combine/i })
    );

    let modalEl = screen.getByRole("dialog", { name: /combine/i });

    userEvent.click(within(modalEl).getByRole("checkbox", { name: /2/ }));
    userEvent.click(within(modalEl).getByRole("button", { name: /combine/i }));
    userEvent.click(
      within(firstCell).getByRole("button", { name: /combine/i })
    );

    modalEl = screen.getByRole("dialog", { name: /combine/i });

    userEvent.click(within(modalEl).getByRole("checkbox", { name: /3/ }));
    userEvent.click(within(modalEl).getByRole("button", { name: /combine/i }));

    expect(firstCell).toBeInTheDocument();
    expect(secondCell).not.toBeInTheDocument();
    expect(lastCell).not.toBeInTheDocument();
  });

  test("should combine groups when adding groups out of sequential order", () => {
    render(<TabbedDisplay />);

    createAnExpandedGroupContainer();
    createAnExpandedGroupContainer();
    createAnExpandedGroupContainer();
    createAnExpandedGroupContainer();
    createAnExpandedGroupContainer();

    const gridEl = screen.getByRole("grid", { name: /groups/i });
    const [firstCell, secondCell, thirdCell, fourthCell, lastCell] = within(
      gridEl
    ).getAllByRole("gridcell", { name: /editor/i });

    userEvent.click(
      within(firstCell).getByRole("button", { name: /combine/i })
    );

    const modalEl = screen.getByRole("dialog", { name: /combine/i });
    const [firstCheckbox, secondCheckbox, thirdCheckbox, lastCheckbox] =
      within(modalEl).getAllByRole("checkbox");

    userEvent.click(lastCheckbox);
    userEvent.click(firstCheckbox);
    userEvent.click(secondCheckbox);
    userEvent.click(thirdCheckbox);
    userEvent.click(within(modalEl).getByRole("button", { name: /combine/i }));
    userEvent.click(
      within(firstCell).getByRole("button", { name: /combine/i })
    );

    expect(firstCell).toBeInTheDocument();
    expect(secondCell).not.toBeInTheDocument();
    expect(thirdCell).not.toBeInTheDocument();
    expect(fourthCell).not.toBeInTheDocument();
    expect(lastCell).not.toBeInTheDocument();
  });

  test("should keep participants when canceling splitting", () => {
    const participantCount = 3;
    const membersTableHeadRowCount = 3;

    render(<TabbedDisplay />);

    createAnExpandedParticipantContainer();
    createAnExpandedParticipantContainer();
    createAnExpandedParticipantContainer();
    createAnExpandedGroupContainer();

    userEvent.click(screen.getByRole("tab", { name: /group/i }));

    const editorEl = screen.getByRole("gridcell", { name: /editor/i });

    userEvent.click(
      within(editorEl).getByRole("button", { name: /group details/i })
    );
    userEvent.click(within(editorEl).getByRole("button", { name: /add/i }));

    const addParticipantModal = screen.getByRole("dialog", {
      name: /participants/i,
    });
    const [firstCheckbox, secondCheckbox, thirdCheckbox] =
      within(addParticipantModal).getAllByRole("checkbox");

    userEvent.click(firstCheckbox);
    userEvent.click(secondCheckbox);
    userEvent.click(thirdCheckbox);
    userEvent.click(
      within(addParticipantModal).getByRole("button", { name: /add/i })
    );
    userEvent.click(within(editorEl).getByRole("button", { name: /split/i }));

    const splitGroupModal = screen.getByRole("dialog", { name: /member/i });
    const [firstMember, secondMember] = within(splitGroupModal).getAllByRole(
      "button",
      { name: /move/i }
    );

    userEvent.click(firstMember);
    userEvent.click(secondMember);
    userEvent.click(
      within(splitGroupModal).getByRole("button", { name: /cancel/i })
    );

    const tableEl = within(editorEl).getByRole("table");

    expect(within(tableEl).getAllByRole("row")).toHaveLength(
      participantCount + membersTableHeadRowCount
    );
  });
});
