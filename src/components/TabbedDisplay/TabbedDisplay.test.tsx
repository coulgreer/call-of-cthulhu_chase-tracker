import React from "react";

import { screen, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TabbedDisplay from ".";

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

  const tablist = screen.getByRole("tablist");

  expect(
    within(tablist).getByRole("tab", { name: /participants/i })
  ).toHaveClass("TabbedDisplay__tab--enabled");
  expect(within(tablist).getByRole("tab", { name: /groups/i })).toHaveClass(
    "TabbedDisplay__tab--disabled"
  );
  expect(
    screen.getByRole("tabpanel", { name: /participants/i })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("tabpanel", { name: /groups/i })
  ).not.toBeInTheDocument();
});

test("should switch display", () => {
  render(<TabbedDisplay />);

  const tablist = screen.getByRole("tablist");
  const groupsTab = within(tablist).getByRole("tab", { name: /groups/i });

  userEvent.click(groupsTab);

  expect(
    within(tablist).getByRole("tab", { name: /participants/i })
  ).toHaveClass("TabbedDisplay__tab--disabled");
  expect(groupsTab).toHaveClass("TabbedDisplay__tab--enabled");
  expect(
    screen.queryByRole("tabpanel", { name: /participants/i })
  ).not.toBeInTheDocument();
  expect(screen.getByRole("tabpanel", { name: /groups/i })).toBeInTheDocument();
});

test("should switch displays", () => {
  render(<TabbedDisplay />);

  userEvent.click(screen.getByRole("tab", { name: /groups/i }));

  expect(
    screen.queryByRole("tabpanel", { name: /participants/i })
  ).not.toBeInTheDocument();
  expect(screen.getByRole("tabpanel", { name: /groups/i })).toBeInTheDocument();
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

    const lowestRow = screen.getByRole("row", { name: /lowest.*mov/i });
    const highestRow = screen.getByRole("row", { name: /highest.*mov/i });

    expect(
      within(lowestRow).getByRole("columnheader", { name: `${newMov}` })
    ).toBeInTheDocument();
    expect(
      within(highestRow).getByRole("columnheader", { name: `${newMov}` })
    ).toBeInTheDocument();
  });

  test("should combine groups when combining groups on more than one separate occassion", () => {
    render(<TabbedDisplay />);
    createAnExpandedGroupContainer();
    createAnExpandedGroupContainer();
    createAnExpandedGroupContainer();

    const grid = screen.getByRole("grid", { name: /groups/i });
    const [firstCell, secondCell, lastCell] = within(grid).getAllByRole(
      "gridcell",
      { name: /editor/i }
    );

    userEvent.click(
      within(firstCell).getByRole("button", { name: /combine/i })
    );

    let modal = screen.getByRole("dialog", { name: /combine/i });

    userEvent.click(within(modal).getByRole("checkbox", { name: /2/ }));
    userEvent.click(within(modal).getByRole("button", { name: /combine/i }));
    userEvent.click(
      within(firstCell).getByRole("button", { name: /combine/i })
    );

    modal = screen.getByRole("dialog", { name: /combine/i });

    userEvent.click(within(modal).getByRole("checkbox", { name: /3/ }));
    userEvent.click(within(modal).getByRole("button", { name: /combine/i }));

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

    const grid = screen.getByRole("grid", { name: /groups/i });
    const [firstCell, secondCell, thirdCell, fourthCell, lastCell] = within(
      grid
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
    const tableHeadRowCount = 3;

    render(<TabbedDisplay />);
    createAnExpandedParticipantContainer();
    createAnExpandedParticipantContainer();
    createAnExpandedParticipantContainer();
    createAnExpandedGroupContainer();

    userEvent.click(screen.getByRole("tab", { name: /group/i }));

    const editor = screen.getByRole("gridcell", { name: /editor/i });

    userEvent.click(
      within(editor).getByRole("button", { name: /group details/i })
    );
    userEvent.click(within(editor).getByRole("button", { name: /add/i }));

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
    userEvent.click(within(editor).getByRole("button", { name: /split/i }));

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

    const table = within(editor).getByRole("table");

    expect(within(table).getAllByRole("row")).toHaveLength(
      participantCount + tableHeadRowCount
    );
  });

  test("should remove target group from other groups when the target is deleted", () => {
    const getNameFromEditor = (editor: HTMLElement) =>
      within(editor)
        .getByRole("textbox", { name: /name/i })
        .getAttribute("value") ?? "value not found";

    render(<TabbedDisplay />);
    createAnExpandedGroupContainer();
    createAnExpandedGroupContainer();
    createAnExpandedGroupContainer();

    userEvent.click(screen.getByRole("tab", { name: /group/i }));

    const grid = screen.getByRole("grid", { name: /groups/i });
    const [firstEditor, secondEditor, thirdEditor] = within(grid).getAllByRole(
      "gridcell",
      { name: /editor/i }
    );
    const firstGroupName = getNameFromEditor(firstEditor);
    const secondGroupName = getNameFromEditor(secondEditor);
    const thirdGroupName = getNameFromEditor(thirdEditor);

    userEvent.selectOptions(
      within(firstEditor).getByRole("combobox", { name: /distancer/i }),
      secondGroupName
    );
    userEvent.selectOptions(
      within(secondEditor).getByRole("combobox", { name: /distancer/i }),
      thirdGroupName
    );
    userEvent.selectOptions(
      within(thirdEditor).getByRole("combobox", { name: /distancer/i }),
      firstGroupName
    );
    userEvent.click(
      within(grid).getAllByRole("button", { name: /delete/i })[1]
    );

    const deleteGroupModal = screen.getByRole("dialog", {
      name: /delete group/i,
    });

    userEvent.click(
      within(deleteGroupModal).getByRole("button", { name: /delete/i })
    );

    expect(
      within(firstEditor).getByRole("combobox", { name: /distancer/i })
    ).not.toHaveValue(secondGroupName);
    expect(within(thirdEditor).queryByRole("list")).not.toBeInTheDocument();
  });

  test("should relieve participants to be assigned to another group when their assigned group is deleted", () => {
    const participantCount = 2;

    render(<TabbedDisplay />);
    createAnExpandedParticipantContainer();
    createAnExpandedParticipantContainer();
    createAnExpandedGroupContainer();
    createAnExpandedGroupContainer();

    userEvent.click(screen.getByRole("tab", { name: /group/i }));

    const grid = screen.getByRole("grid", { name: /groups/i });
    const [firstEditor, secondEditor] = within(grid).getAllByRole("gridcell", {
      name: /editor/i,
    });
    const [firstDeleteButton] = within(grid).getAllByRole("button", {
      name: /delete/i,
    });

    userEvent.click(within(firstEditor).getByRole("button", { name: /add/i }));

    let memberAdditionModal = screen.getByRole("dialog", {
      name: /participant/i,
    });
    const [firstCheckbox] =
      within(memberAdditionModal).getAllByRole("checkbox");

    userEvent.click(firstCheckbox);
    userEvent.click(
      within(memberAdditionModal).getByRole("button", { name: /add/i })
    );
    userEvent.click(firstDeleteButton);
    userEvent.click(
      within(screen.getByRole("dialog", { name: /delete/i })).getByRole(
        "button",
        { name: /delete/i }
      )
    );
    userEvent.click(within(secondEditor).getByRole("button", { name: /add/i }));

    memberAdditionModal = screen.getByRole("dialog", {
      name: /participant/i,
    });

    expect(within(memberAdditionModal).getAllByRole("checkbox")).toHaveLength(
      participantCount
    );
  });
});
