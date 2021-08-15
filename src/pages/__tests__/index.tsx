import React from "react";

import { screen, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PureHome as Home } from "../index";

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

function setup() {
  render(<Home />);

  const controllerGroup = screen.getByRole("group", { name: /control/i });
  const tablist = screen.getByRole("tablist");
  const clickStart = () =>
    userEvent.click(
      within(controllerGroup).getByRole("button", { name: /start/i })
    );
  const clickStop = () =>
    userEvent.click(
      within(controllerGroup).getByRole("button", { name: /stop/i })
    );
  const createParticipant = () => {
    userEvent.click(within(tablist).getByRole("tab", { name: /participant/i }));
    userEvent.click(screen.getByRole("button", { name: /create/i }));
  };
  const createAndExpandParticipant = () => {
    userEvent.click(within(tablist).getByRole("tab", { name: /participant/i }));

    const participantGrid = screen.getByRole("grid", { name: /participant/i });

    userEvent.click(screen.getByRole("button", { name: /create/i }));

    const participantRows = within(participantGrid).getAllByRole("row");
    const latestParticipant = participantRows[participantRows.length - 1];

    userEvent.click(
      within(latestParticipant).getByRole("button", { name: /detail/i })
    );
  };
  const createGroup = () => {
    userEvent.click(within(tablist).getByRole("tab", { name: /group/i }));

    userEvent.click(screen.getByRole("button", { name: /create/i }));
  };
  const createAndExpandGroup = () => {
    userEvent.click(within(tablist).getByRole("tab", { name: /group/i }));

    userEvent.click(screen.getByRole("button", { name: /create/i }));

    const groupGrid = screen.getByRole("grid", { name: /group/i });
    const groupRows = within(groupGrid).getAllByRole("row");
    const latestGroup = groupRows[groupRows.length - 1];

    userEvent.click(
      within(latestGroup).getByRole("button", { name: /detail/i })
    );
  };
  const setDerivedSpeed = (name: string, targetSpeed: number) => {
    userEvent.click(within(tablist).getByRole("tab", { name: /participant/i }));

    const grid = screen.getByRole("grid", { name: /participant/i });
    const editor = within(grid).getByRole("gridcell", {
      name: new RegExp(`${name}.*editor`, "i"),
    });
    const movementRateTextbox = within(editor).getByRole("spinbutton", {
      name: /mov/i,
    });
    const speedModifierTextbox = within(editor).getByRole("spinbutton", {
      name: /spd/i,
    });

    const speedModifier = 1;
    const movementRate = targetSpeed - speedModifier;

    userEvent.clear(movementRateTextbox);
    userEvent.type(movementRateTextbox, movementRate.toString());
    userEvent.clear(speedModifierTextbox);
    userEvent.type(speedModifierTextbox, speedModifier.toString());
  };

  return {
    clickStart,
    clickStop,
    createParticipant,
    createAndExpandParticipant,
    createGroup,
    createAndExpandGroup,
    setDerivedSpeed,
  };
}

test("should render properly", () => {
  render(<Home />);

  expect(screen.getByRole("main")).toBeInTheDocument();
  expect(
    screen.getByRole("group", { name: /chase.*controls/i })
  ).toBeInTheDocument();
  expect(screen.getByRole("tablist")).toBeInTheDocument();
  expect(screen.getByRole("tabpanel")).toBeInTheDocument();
});

describe("Chase Controls", () => {
  test("should render properly when chase starts", () => {
    const activeClass = "ChaseControls--active";
    const { clickStart } = setup();
    const buttonGroup = screen.getByRole("group", { name: /chase.*controls/i });

    clickStart();

    expect(
      within(buttonGroup).getByRole("button", { name: /start/i })
    ).toHaveClass(activeClass);
    expect(
      within(buttonGroup).getByRole("button", { name: /stop/i })
    ).not.toHaveClass(activeClass);
  });

  test("should render properly when chase stops again", () => {
    const activeClass = "ChaseControls--active";
    const { clickStart, clickStop } = setup();
    const buttonGroup = screen.getByRole("group", { name: /chase.*controls/i });

    clickStart();
    clickStop();

    expect(
      within(buttonGroup).getByRole("button", { name: /start/i })
    ).not.toHaveClass(activeClass);
    expect(
      within(buttonGroup).getByRole("button", { name: /stop/i })
    ).toHaveClass(activeClass);
  });

  test("should render properly when chase stopped", () => {
    render(<Home />);

    const tablist = screen.getByRole("tablist");
    const controllerGroup = screen.getByRole("group", { name: /control/i });

    userEvent.click(
      within(controllerGroup).getByRole("button", { name: /stop/i })
    );
    userEvent.click(within(tablist).getByRole("tab", { name: /participant/i }));
    userEvent.click(
      screen.getByRole("button", { name: /create participant/i })
    );

    const participantGrid = screen.getByRole("grid", { name: /participant/i });

    expect(
      within(participantGrid).getByText(/actions.*n\/a/i)
    ).toBeInTheDocument();
  });
});

describe("Action Count", () => {
  test("should accurately calculate action count", () => {
    const {
      clickStart,
      createParticipant,
      createAndExpandGroup,
      setDerivedSpeed,
    } = setup();
    const participantName1 = "1";
    const participantName2 = "2";
    const participantName3 = "3";

    createParticipant();
    createParticipant();
    createParticipant();

    setDerivedSpeed(participantName1, 1);
    setDerivedSpeed(participantName2, 3);
    setDerivedSpeed(participantName3, 6);

    createAndExpandGroup();

    const groupEditor = within(screen.getByRole("grid")).getByRole("gridcell", {
      name: /editor/i,
    });

    userEvent.click(within(groupEditor).getByRole("button", { name: /add/i }));

    const modal = screen.getByRole("dialog", { name: /participant/i });

    userEvent.click(
      within(modal).getByRole("checkbox", {
        name: new RegExp(participantName1),
      })
    );
    userEvent.click(
      within(modal).getByRole("checkbox", {
        name: new RegExp(participantName2),
      })
    );
    userEvent.click(
      within(modal).getByRole("checkbox", {
        name: new RegExp(participantName3),
      })
    );
    userEvent.click(within(modal).getByRole("button", { name: /add/i }));
    userEvent.click(screen.getByRole("tab", { name: /participant/i }));

    const participantRow1 = within(screen.getByRole("grid")).getByRole(
      "gridcell",
      { name: new RegExp(`${participantName1}.*editor`, "i") }
    );
    const participantRow2 = within(screen.getByRole("grid")).getByRole(
      "gridcell",
      { name: new RegExp(`${participantName2}.*editor`, "i") }
    );
    const participantRow3 = within(screen.getByRole("grid")).getByRole(
      "gridcell",
      { name: new RegExp(`${participantName3}.*editor`, "i") }
    );

    clickStart();

    expect(within(participantRow1).getByText(/action.*1/i)).toBeInTheDocument();
    expect(within(participantRow2).getByText(/action.*2/i)).toBeInTheDocument();
    expect(within(participantRow3).getByText(/action.*3/i)).toBeInTheDocument();
  });

  test("should accurately calculate action count when participant is ostracized", () => {
    const {
      clickStart,
      createParticipant,
      createAndExpandGroup,
      setDerivedSpeed,
    } = setup();
    const participantName1 = "1";
    const participantName2 = "2";
    const participantName3 = "3";
    const participantName4 = "4";

    createParticipant();
    createParticipant();
    createParticipant();
    createParticipant();

    setDerivedSpeed(participantName1, 1);
    setDerivedSpeed(participantName2, 3);
    setDerivedSpeed(participantName3, 6);
    setDerivedSpeed(participantName4, 10);

    createAndExpandGroup();

    const groupEditor = within(screen.getByRole("grid")).getByRole("gridcell", {
      name: /editor/i,
    });

    userEvent.click(within(groupEditor).getByRole("button", { name: /add/i }));

    const modal = screen.getByRole("dialog", { name: /participant/i });

    userEvent.click(
      within(modal).getByRole("checkbox", {
        name: new RegExp(participantName1),
      })
    );
    userEvent.click(
      within(modal).getByRole("checkbox", {
        name: new RegExp(participantName2),
      })
    );
    userEvent.click(
      within(modal).getByRole("checkbox", {
        name: new RegExp(participantName3),
      })
    );
    userEvent.click(within(modal).getByRole("button", { name: /add/i }));
    userEvent.click(screen.getByRole("tab", { name: /participant/i }));

    const participantRow1 = within(screen.getByRole("grid")).getByRole(
      "gridcell",
      { name: new RegExp(`${participantName1}.*editor`, "i") }
    );
    const participantRow2 = within(screen.getByRole("grid")).getByRole(
      "gridcell",
      { name: new RegExp(`${participantName2}.*editor`, "i") }
    );
    const participantRow3 = within(screen.getByRole("grid")).getByRole(
      "gridcell",
      { name: new RegExp(`${participantName3}.*editor`, "i") }
    );
    const participantRow4 = within(screen.getByRole("grid")).getByRole(
      "gridcell",
      { name: new RegExp(`${participantName4}.*editor`, "i") }
    );

    clickStart();

    expect(within(participantRow1).getByText(/action.*1/i)).toBeInTheDocument();
    expect(within(participantRow2).getByText(/action.*2/i)).toBeInTheDocument();
    expect(within(participantRow3).getByText(/action.*3/i)).toBeInTheDocument();
    expect(
      within(participantRow4).getByText(/action.*n\/a/i)
    ).toBeInTheDocument();
  });

  test("should accurately calculate action count when more than one group exists with participants", () => {
    const {
      clickStart,
      createParticipant,
      createAndExpandGroup,
      setDerivedSpeed,
    } = setup();
    const participantName1 = "1";
    const participantName2 = "2";
    const participantName3 = "3";
    const participantName4 = "4";
    const participantName5 = "5";
    const participantName6 = "6";

    createParticipant();
    createParticipant();
    createParticipant();
    createParticipant();
    createParticipant();
    createParticipant();

    setDerivedSpeed(participantName1, 2);
    setDerivedSpeed(participantName2, 4);
    setDerivedSpeed(participantName3, 6);
    setDerivedSpeed(participantName4, 8);
    setDerivedSpeed(participantName5, 10);
    setDerivedSpeed(participantName6, 12);

    createAndExpandGroup();
    createAndExpandGroup();

    const [groupEditor1, groupEditor2] = within(
      screen.getByRole("grid")
    ).getAllByRole("gridcell", { name: /editor/i });

    userEvent.click(within(groupEditor1).getByRole("button", { name: /add/i }));

    let modal = screen.getByRole("dialog", { name: /participant/i });

    userEvent.click(
      within(modal).getByRole("checkbox", {
        name: new RegExp(participantName1),
      })
    );
    userEvent.click(
      within(modal).getByRole("checkbox", {
        name: new RegExp(participantName2),
      })
    );
    userEvent.click(
      within(modal).getByRole("checkbox", {
        name: new RegExp(participantName3),
      })
    );
    userEvent.click(within(modal).getByRole("button", { name: /add/i }));
    userEvent.click(within(groupEditor2).getByRole("button", { name: /add/i }));

    modal = screen.getByRole("dialog", { name: /participant/i });

    userEvent.click(
      within(modal).getByRole("checkbox", {
        name: new RegExp(participantName4),
      })
    );
    userEvent.click(
      within(modal).getByRole("checkbox", {
        name: new RegExp(participantName5),
      })
    );
    userEvent.click(
      within(modal).getByRole("checkbox", {
        name: new RegExp(participantName6),
      })
    );
    userEvent.click(within(modal).getByRole("button", { name: /add/i }));
    userEvent.click(screen.getByRole("tab", { name: /participant/i }));

    const participantRow1 = within(screen.getByRole("grid")).getByRole(
      "gridcell",
      { name: new RegExp(`${participantName1}.*editor`, "i") }
    );
    const participantRow2 = within(screen.getByRole("grid")).getByRole(
      "gridcell",
      { name: new RegExp(`${participantName2}.*editor`, "i") }
    );
    const participantRow3 = within(screen.getByRole("grid")).getByRole(
      "gridcell",
      { name: new RegExp(`${participantName3}.*editor`, "i") }
    );
    const participantRow4 = within(screen.getByRole("grid")).getByRole(
      "gridcell",
      { name: new RegExp(`${participantName4}.*editor`, "i") }
    );
    const participantRow5 = within(screen.getByRole("grid")).getByRole(
      "gridcell",
      { name: new RegExp(`${participantName5}.*editor`, "i") }
    );
    const participantRow6 = within(screen.getByRole("grid")).getByRole(
      "gridcell",
      { name: new RegExp(`${participantName6}.*editor`, "i") }
    );

    clickStart();

    expect(within(participantRow1).getByText(/action.*1/i)).toBeInTheDocument();
    expect(within(participantRow2).getByText(/action.*2/i)).toBeInTheDocument();
    expect(within(participantRow3).getByText(/action.*3/i)).toBeInTheDocument();
    expect(within(participantRow4).getByText(/action.*1/i)).toBeInTheDocument();
    expect(within(participantRow5).getByText(/action.*2/i)).toBeInTheDocument();
    expect(within(participantRow6).getByText(/action.*3/i)).toBeInTheDocument();
  });

  test("should accurately calculate action count when two participants in the same group share the same derived speed", () => {
    const {
      clickStart,
      createParticipant,
      createAndExpandGroup,
      setDerivedSpeed,
    } = setup();
    const participantName1 = "1";
    const participantName2 = "2";
    const participantName3 = "3";
    const participantName4 = "4";

    createParticipant();
    createParticipant();
    createParticipant();
    createParticipant();

    setDerivedSpeed(participantName1, 1);
    setDerivedSpeed(participantName2, 1);
    setDerivedSpeed(participantName3, 2);
    setDerivedSpeed(participantName4, 3);

    createAndExpandGroup();

    const groupEditor = within(screen.getByRole("grid")).getByRole("gridcell", {
      name: /editor/i,
    });

    userEvent.click(within(groupEditor).getByRole("button", { name: /add/i }));

    const modal = screen.getByRole("dialog", { name: /participant/i });

    userEvent.click(
      within(modal).getByRole("checkbox", {
        name: new RegExp(participantName1),
      })
    );
    userEvent.click(
      within(modal).getByRole("checkbox", {
        name: new RegExp(participantName2),
      })
    );
    userEvent.click(
      within(modal).getByRole("checkbox", {
        name: new RegExp(participantName3),
      })
    );
    userEvent.click(
      within(modal).getByRole("checkbox", {
        name: new RegExp(participantName4),
      })
    );
    userEvent.click(within(modal).getByRole("button", { name: /add/i }));
    userEvent.click(screen.getByRole("tab", { name: /participant/i }));

    const participantRow1 = within(screen.getByRole("grid")).getByRole(
      "gridcell",
      { name: new RegExp(`${participantName1}.*editor`, "i") }
    );
    const participantRow2 = within(screen.getByRole("grid")).getByRole(
      "gridcell",
      { name: new RegExp(`${participantName2}.*editor`, "i") }
    );
    const participantRow3 = within(screen.getByRole("grid")).getByRole(
      "gridcell",
      { name: new RegExp(`${participantName3}.*editor`, "i") }
    );
    const participantRow4 = within(screen.getByRole("grid")).getByRole(
      "gridcell",
      { name: new RegExp(`${participantName4}.*editor`, "i") }
    );

    clickStart();

    expect(within(participantRow1).getByText(/action.*1/i)).toBeInTheDocument();
    expect(within(participantRow2).getByText(/action.*1/i)).toBeInTheDocument();
    expect(within(participantRow3).getByText(/action.*2/i)).toBeInTheDocument();
    expect(within(participantRow4).getByText(/action.*3/i)).toBeInTheDocument();
  });
});
