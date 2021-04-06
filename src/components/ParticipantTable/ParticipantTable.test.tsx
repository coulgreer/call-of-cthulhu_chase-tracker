import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";

import ParticipantTable from ".";
import ParticipantRow from "../ParticipantRow";

const WARNING_MESSAGE =
  "Shame. No prey for the chase. Still, keep your wits about you.";

describe("Warning Message prop", () => {
  test("should render with an error message when no participants exist", () => {
    render(<ParticipantTable warningMessage={WARNING_MESSAGE} />);

    expect(screen.getByText(WARNING_MESSAGE)).toBeInTheDocument();
  });

  test("should render a participant instead of an error message when a participant exists", () => {
    render(<ParticipantTable warningMessage={WARNING_MESSAGE} />);

    userEvent.click(screen.getByRole("button", { name: /add participant/i }));

    expect(screen.queryByText(WARNING_MESSAGE)).not.toBeInTheDocument();
    expect(
      screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #1`)
    ).toBeInTheDocument();
  });
});

describe("Participant Removal", () => {
  test("should remove the designated participant", () => {
    render(<ParticipantTable warningMessage={WARNING_MESSAGE} />);

    const addButton = screen.getByRole("button", { name: /add participant/i });
    userEvent.click(addButton);
    userEvent.click(addButton);
    userEvent.click(addButton);
    userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`remove: ${ParticipantTable.DEFAULT_NAME} #1`, "i"),
      })
    );
    userEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(
      screen.queryByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #1`)
    ).not.toBeInTheDocument();
    expect(
      screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #2`)
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #3`)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("dialog", { name: /confirm removal/i })
    ).not.toBeInTheDocument();
  });

  test("should preserve all participants when removal is canceled via button", () => {
    render(<ParticipantTable warningMessage={WARNING_MESSAGE} />);

    const addButton = screen.getByRole("button", { name: /add participant/i });
    userEvent.click(addButton);
    userEvent.click(addButton);
    userEvent.click(addButton);
    userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`remove: ${ParticipantTable.DEFAULT_NAME} #1`, "i"),
      })
    );
    userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(
      screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #1`)
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #2`)
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #3`)
    ).toBeInTheDocument();
  });

  test("should preserve all participants when removal is canceled via 'esc' key", () => {
    render(<ParticipantTable warningMessage={WARNING_MESSAGE} />);

    const addButton = screen.getByRole("button", { name: /add participant/i });
    userEvent.click(addButton);
    userEvent.click(addButton);
    userEvent.click(addButton);
    userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`remove: ${ParticipantTable.DEFAULT_NAME} #1`, "i"),
      })
    );
    userEvent.type(
      screen.getByRole("dialog", { name: /confirm removal/i }),
      "{esc}"
    );

    expect(
      screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #1`)
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #2`)
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(`${ParticipantTable.DEFAULT_NAME} #3`)
    ).toBeInTheDocument();
  });
});

test("should have the appropriate default participant name when a participant has been removed", () => {
  render(<ParticipantTable warningMessage={WARNING_MESSAGE} />);

  const addButton = screen.getByRole("button", { name: /add participant/i });
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

describe("Participant manipulation", () => {
  const validInput = 11;

  function renderTableWithExpandedRow() {
    render(<ParticipantTable warningMessage={WARNING_MESSAGE} />);

    userEvent.click(screen.getByRole("button", { name: /add participant/i }));
    userEvent.click(screen.getByRole("button", { name: /expand/i }));
  }

  describe("Naming Hazard Skill", () => {
    const [
      primaryStat,
      secondaryStat,
    ] = ParticipantRow.DEFAULT_HAZARD_STATISTICS;

    test("should reset textbox to current name when another hazard skill has been renamed", () => {
      const firstNewName = "First Name";
      renderTableWithExpandedRow();

      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`rename: ${primaryStat.name}`),
        })
      );

      const renameInputEl = screen.getByRole("textbox", { name: /new name/i });
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
      renderTableWithExpandedRow();

      expect(screen.queryByText(newName)).not.toBeInTheDocument();
      expect(screen.getByText(originName)).toBeInTheDocument();

      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`rename: ${originName}`, "i"),
        })
      );

      const nameTextboxEl = screen.getByRole("textbox", { name: /new name/i });
      userEvent.clear(nameTextboxEl);
      userEvent.type(nameTextboxEl, newName);

      userEvent.click(screen.getByRole("button", { name: /^rename$/i }));

      expect(screen.getByText(newName)).toBeInTheDocument();
      expect(screen.queryByText(originName)).not.toBeInTheDocument();
    });

    test("should change 'hazard statistic' to the last valid value when changed to an invalid value and focus lost", () => {
      renderTableWithExpandedRow();

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
      renderTableWithExpandedRow();

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
      renderTableWithExpandedRow();

      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`rename: ${primaryStat.name}`),
        })
      );

      const renameInputEl = screen.getByRole("textbox", { name: /new name/i });
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
      renderTableWithExpandedRow();

      expect(screen.queryByText(newName)).not.toBeInTheDocument();
      expect(screen.getByText(originName)).toBeInTheDocument();

      userEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`rename: ${originName}`, "i"),
        })
      );

      const nameTextboxEl = screen.getByRole("textbox", { name: /new name/i });
      userEvent.clear(nameTextboxEl);
      userEvent.type(nameTextboxEl, newName);

      userEvent.click(screen.getByRole("button", { name: /^rename$/i }));

      expect(screen.getByText(newName)).toBeInTheDocument();
      expect(screen.queryByText(originName)).not.toBeInTheDocument();
    });

    test("should change 'speed statistic' to the last valid value when changed to an invalid value and focus lost", () => {
      renderTableWithExpandedRow();

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
      renderTableWithExpandedRow();

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
      renderTableWithExpandedRow();

      expect(screen.queryByLabelText(/new stat #8/i)).not.toBeInTheDocument();

      userEvent.click(
        screen.getAllByRole("button", { name: /create statistic/i })[1]
      );

      expect(screen.getByLabelText(/new stat #8/i)).toBeInTheDocument();
    });

    test("should delete given hazard stat when the 'delete hazard statistic' is clicked", () => {
      renderTableWithExpandedRow();

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
      renderTableWithExpandedRow();

      expect(screen.queryByLabelText(/new stat #6/i)).not.toBeInTheDocument();

      userEvent.click(
        screen.getAllByRole("button", { name: /create statistic/i })[0]
      );

      expect(screen.getByLabelText(/new stat #6/i)).toBeInTheDocument();
    });

    test("should delete given speed stat when the 'delete speed stat' is clicked", () => {
      renderTableWithExpandedRow();

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
    render(<ParticipantTable warningMessage={WARNING_MESSAGE} />);

    const addButton = screen.getByRole("button", { name: /add participant/i });

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
