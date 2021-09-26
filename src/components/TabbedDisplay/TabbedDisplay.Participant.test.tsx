import * as React from "react";

import { screen, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TabbedDisplay from ".";
import ParticipantContainer from "../ParticipantContainer";

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

test("should create participant", () => {
  render(<TabbedDisplay />);

  userEvent.click(screen.getByRole("tab", { name: /participants/i }));
  userEvent.click(screen.getByRole("button", { name: /create participant/i }));

  expect(screen.queryByText(/no.*participant/i)).not.toBeInTheDocument();
  expect(
    screen.getByRole("grid", { name: /participant/i })
  ).toBeInTheDocument();
});

test("should delete participant", () => {
  render(<TabbedDisplay />);
  createAnExpandedParticipantContainer();
  createAnExpandedParticipantContainer();
  createAnExpandedParticipantContainer();

  userEvent.click(screen.getByRole("button", { name: /remove:.*1/i }));
  userEvent.click(screen.getByRole("button", { name: /^delete$/i }));

  expect(screen.getAllByRole("row")).toHaveLength(2);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("should create participant with the appropriate name when a participant has been removed and then another created", () => {
  render(<TabbedDisplay />);

  userEvent.click(screen.getByRole("tab", { name: /participants/i }));

  const createParticipantButton = screen.getByRole("button", {
    name: /create participant/i,
  });
  userEvent.click(createParticipantButton);
  userEvent.click(createParticipantButton);
  userEvent.click(createParticipantButton);
  userEvent.click(createParticipantButton);
  userEvent.click(screen.getByRole("button", { name: /remove:.*2/i }));
  userEvent.click(screen.getByRole("button", { name: /delete/i }));
  userEvent.click(screen.getByRole("button", { name: /remove:.*4/i }));
  userEvent.click(screen.getByRole("button", { name: /delete/i }));
  userEvent.click(createParticipantButton);

  expect(screen.getByDisplayValue(/participant.*1/i)).toBeInTheDocument();
  expect(screen.getByDisplayValue(/participant.*2/i)).toBeInTheDocument();
  expect(screen.getByDisplayValue(/participant.*3/i)).toBeInTheDocument();
  expect(screen.queryByDisplayValue(/participant.*4/i)).not.toBeInTheDocument();
  expect(screen.queryByDisplayValue(/participant.*5/i)).not.toBeInTheDocument();
});

describe("Statistics", () => {
  const validScore = "11";
  const invalidScore = "invalid";

  describe("Core Statistics", () => {
    describe("when changing to valid score", () => {
      test("should update dexterity score on participant", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        const input = screen.getByRole("spinbutton", { name: /dex/i });

        userEvent.clear(input);
        userEvent.type(input, validScore);
        input.blur();

        expect(input).toHaveDisplayValue(validScore);
      });

      test("should update derived speed score on participant", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        const input = screen.getByRole("spinbutton", { name: /spd/i });

        userEvent.clear(input);
        userEvent.type(input, validScore);
        input.blur();

        expect(input).toHaveDisplayValue(validScore);
      });

      test("should update movement rate score on participant", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        const input = screen.getByRole("spinbutton", { name: /mov/i });

        userEvent.clear(input);
        userEvent.type(input, validScore);
        input.blur();

        expect(input).toHaveDisplayValue(validScore);
      });
    });

    describe("when changing to invalid score", () => {
      test("should revert to prior, valid dexterity score on participant", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        const input = screen.getByRole("spinbutton", { name: /dex/i });

        userEvent.clear(input);
        userEvent.type(input, validScore);
        userEvent.clear(input);
        userEvent.type(input, invalidScore);
        input.blur();

        expect(input).toHaveDisplayValue(validScore);
      });

      test("should revert to prior, valid derived speed score on participant", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        const input = screen.getByRole("spinbutton", { name: /spd/i });

        userEvent.clear(input);
        userEvent.type(input, validScore);
        userEvent.clear(input);
        userEvent.type(input, invalidScore);
        input.blur();

        expect(input).toHaveDisplayValue(validScore);
      });

      test("should revert to prior, valid movement rate score on participant", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        const input = screen.getByRole("spinbutton", { name: /mov/i });

        userEvent.clear(input);
        userEvent.type(input, validScore);
        userEvent.clear(input);
        userEvent.type(input, invalidScore);
        input.blur();

        expect(input).toHaveDisplayValue(validScore);
      });
    });

    describe("when leaving score blank", () => {
      test("should revert to prior, valid dexterity score on participant", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        const input = screen.getByRole("spinbutton", { name: /dex/i });

        userEvent.clear(input);
        userEvent.type(input, validScore);
        userEvent.clear(input);
        input.blur();

        expect(input).toHaveDisplayValue(validScore);
      });

      test("should revert to prior, valid derived speed score on participant", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        const input = screen.getByRole("spinbutton", { name: /spd/i });

        userEvent.clear(input);
        userEvent.type(input, validScore);
        userEvent.clear(input);
        input.blur();

        expect(input).toHaveDisplayValue(validScore);
      });

      test("should revert to prior, valid movement rate score on participant", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        const input = screen.getByRole("spinbutton", { name: /mov/i });

        userEvent.clear(input);
        userEvent.type(input, validScore);
        userEvent.clear(input);
        input.blur();

        expect(input).toHaveDisplayValue(validScore);
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

        const modal = screen.getByRole("dialog");
        const textbox = within(modal).getByRole("textbox", { name: /name/i });

        userEvent.clear(textbox);
        userEvent.type(textbox, validName);
        userEvent.click(
          within(modal).getByRole("button", { name: /^rename$/i })
        );

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

        const modal = screen.getByRole("dialog");
        const textbox = within(modal).getByRole("textbox", { name: /name/i });

        userEvent.clear(textbox);
        userEvent.type(textbox, validName);
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

        const modal = screen.getByRole("dialog");
        const textbox = within(modal).getByRole("textbox", { name: /name/i });

        userEvent.clear(textbox);
        userEvent.type(textbox, validName);
        userEvent.clear(textbox);
        userEvent.type(textbox, invalidName);
        userEvent.click(
          within(modal).getByRole("button", { name: /^rename$/i })
        );

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

        const modal = screen.getByRole("dialog");
        const textbox = within(modal).getByRole("textbox", { name: /name/i });

        userEvent.clear(textbox);
        userEvent.type(textbox, validName);
        userEvent.clear(textbox);
        userEvent.type(textbox, invalidName);
        userEvent.click(
          within(modal).getByRole("button", { name: /^rename$/i })
        );

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

        const modal = screen.getByRole("dialog");
        const textbox = within(modal).getByRole("textbox", { name: /name/i });

        userEvent.clear(textbox);
        userEvent.type(textbox, validName);
        userEvent.clear(textbox);
        userEvent.click(
          within(modal).getByRole("button", { name: /^rename$/i })
        );

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

        const modal = screen.getByRole("dialog");
        const textbox = within(modal).getByRole("textbox", { name: /name/i });

        userEvent.clear(textbox);
        userEvent.type(textbox, validName);
        userEvent.clear(textbox);
        userEvent.click(
          within(modal).getByRole("button", { name: /^rename$/i })
        );

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

        let modal = screen.getByRole("dialog");
        const textbox = within(modal).getByRole("textbox", { name: /name/i });

        userEvent.clear(textbox);
        userEvent.type(textbox, validName);
        userEvent.click(
          within(modal).getByRole("button", { name: /^rename$/i })
        );
        userEvent.click(
          screen.getByRole("button", {
            name: new RegExp(`rename: ${secondHazardStatistic.name}`),
          })
        );

        modal = screen.getByRole("dialog");

        expect(
          within(modal).getByRole("textbox", { name: /name/i })
        ).toHaveDisplayValue(secondHazardStatistic.name);
      });

      test("should set renaming textbox to the associated speed statistics name", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        userEvent.click(
          screen.getByRole("button", {
            name: new RegExp(`rename: ${firstSpeedStatistic.name}`),
          })
        );

        let modal = screen.getByRole("dialog");
        const textbox = within(modal).getByRole("textbox", { name: /name/i });

        userEvent.clear(textbox);
        userEvent.type(textbox, validName);
        userEvent.click(
          within(modal).getByRole("button", { name: /^rename$/i })
        );
        userEvent.click(
          screen.getByRole("button", {
            name: new RegExp(`rename: ${secondSpeedStatistic.name}`),
          })
        );

        modal = screen.getByRole("dialog");

        expect(
          within(modal).getByRole("textbox", { name: /name/i })
        ).toHaveDisplayValue(secondSpeedStatistic.name);
      });
    });

    describe("when changing to valid score", () => {
      test("should update hazard statistic", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        const input = screen.getByRole("spinbutton", {
          name: firstHazardStatistic.name,
        });

        userEvent.clear(input);
        userEvent.type(input, validScore);
        input.blur();

        expect(input).toHaveDisplayValue(validScore);
      });

      test("should update speed statistic", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        const input = screen.getByRole("spinbutton", {
          name: firstSpeedStatistic.name,
        });

        userEvent.clear(input);
        userEvent.type(input, validScore);
        input.blur();

        expect(input).toHaveDisplayValue(validScore);
      });
    });

    describe("when changing to invalid score", () => {
      test("should revert to prior, valid hazard statistic", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        const input = screen.getByRole("spinbutton", {
          name: firstHazardStatistic.name,
        });

        userEvent.clear(input);
        userEvent.type(input, validScore);
        userEvent.clear(input);
        input.blur();

        expect(input).toHaveDisplayValue(validScore);
      });

      test("should revert to prior, valid speed statistic", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        const input = screen.getByRole("spinbutton", {
          name: firstSpeedStatistic.name,
        });

        userEvent.clear(input);
        userEvent.type(input, validScore);
        userEvent.clear(input);
        input.blur();

        expect(input).toHaveDisplayValue(validScore);
      });
    });

    describe("when leaving score blank", () => {
      test("should revert to hazard statistic's prior valid score", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        const input = screen.getByRole("spinbutton", {
          name: firstHazardStatistic.name,
        });

        userEvent.clear(input);
        userEvent.type(input, validScore);
        userEvent.clear(input);
        input.blur();

        expect(input).toHaveDisplayValue(validScore);
      });

      test("should revert to speed statistic's prior valid score", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        const input = screen.getByRole("spinbutton", {
          name: firstSpeedStatistic.name,
        });

        userEvent.clear(input);
        userEvent.type(input, validScore);
        userEvent.clear(input);
        input.blur();

        expect(input).toHaveDisplayValue(validScore);
      });
    });

    describe("when creating a statistic", () => {
      test("should create hazard statistic with appropriate name", () => {
        const hazardStatisticCount =
          ParticipantContainer.DEFAULT_HAZARD_STATISTICS.length;

        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        userEvent.click(
          screen.getAllByRole("button", { name: /create statistic/i })[1]
        );

        expect(
          screen.getByRole("spinbutton", {
            name: new RegExp(`stat.*${hazardStatisticCount + 1}`, "i"),
          })
        ).toBeInTheDocument();
      });

      test("should create speed statistic with appropriate name", () => {
        const speedStatisticCount =
          ParticipantContainer.DEFAULT_SPEED_STATISTICS.length;

        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        userEvent.click(
          screen.getAllByRole("button", { name: /create statistic/i })[0]
        );

        expect(
          screen.getByRole("spinbutton", {
            name: new RegExp(`stat.*${speedStatisticCount + 1}`, "i"),
          })
        ).toBeInTheDocument();
      });
    });

    describe("when deleting a statistic", () => {
      test("should delete given hazard stat when the 'delete hazard statistic' is clicked", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        userEvent.click(
          screen.getByRole("button", {
            name: new RegExp(`delete: ${firstHazardStatistic.name}`, "i"),
          })
        );

        expect(
          screen.queryByLabelText(firstHazardStatistic.name)
        ).not.toBeInTheDocument();
      });

      test("should delete given speed stat when the 'delete speed stat' is clicked", () => {
        render(<TabbedDisplay />);
        createAnExpandedParticipantContainer();

        userEvent.click(
          screen.getByRole("button", {
            name: new RegExp(`delete: ${firstSpeedStatistic.name}`, "i"),
          })
        );

        expect(
          screen.queryByLabelText(firstSpeedStatistic.name)
        ).not.toBeInTheDocument();
      });
    });

    describe("when deleting a statistic and then creating a new statistic", () => {
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
          screen.getByRole("spinbutton", { name: /stat.*1/i })
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
          screen.getByRole("spinbutton", { name: /stat.*1/i })
        ).toBeInTheDocument();
      });
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
    userEvent.click(screen.getByRole("button", { name: /remove:.*1$/i }));
    userEvent.click(screen.getByRole("button", { name: /delete/i }));

    /* Then, delete another participant that starts with a differing digit
       from the first, but is not at the end of the sequence. */
    userEvent.click(screen.getByRole("button", { name: /remove:.*3$/i }));
    userEvent.click(screen.getByRole("button", { name: /delete/i }));

    // Replenish the participants.
    userEvent.click(createParticipantButton);
    userEvent.click(createParticipantButton);

    expect(screen.getByDisplayValue(/participant.*1$/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/participant.*2$/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/participant.*3$/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/participant.*4$/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/participant.*5$/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/participant.*6$/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/participant.*7$/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/participant.*8$/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/participant.*9$/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/participant.*10$/i)).toBeInTheDocument();
    expect(
      screen.queryByDisplayValue(/participant.*11$/i)
    ).not.toBeInTheDocument();
  });
});
