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

const tableHeadRowCount = 3;

test("should render properly when a group is created", () => {
  render(<TabbedDisplay />);

  userEvent.click(screen.getByRole("tab", { name: /groups/i }));
  userEvent.click(screen.getByRole("button", { name: /create group/i }));

  expect(screen.queryByText(/no group/i)).not.toBeInTheDocument();
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

  userEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
  userEvent.click(screen.getByRole("button", { name: /^delete$/i }));

  expect(screen.getAllByRole("row", { name: /group.*editor/i })).toHaveLength(
    2
  );
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

  userEvent.click(within(modalEl).getByRole("checkbox", { name: /group 2/i }));
  userEvent.click(within(modalEl).getByRole("checkbox", { name: /group 3/i }));
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

  userEvent.click(within(modalEl).getByRole("checkbox", { name: /group 2/i }));
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

  userEvent.click(within(modalEl).getByRole("checkbox", { name: /group 2/i }));
  userEvent.clear(newNameEl);
  userEvent.type(newNameEl, validName);
  userEvent.clear(newNameEl);
  userEvent.click(within(modalEl).getByRole("button", { name: /combine/i }));

  expect(within(editorEl).getByRole("textbox", { name: /name/i })).toHaveValue(
    validName
  );
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
  userEvent.click(within(addMemberModal).getByRole("button", { name: /add/i }));

  const groupGrid = screen.getByRole("grid", { name: /groups/i });

  userEvent.click(within(groupGrid).getByRole("button", { name: /split/i }));

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

  const originalGroupCell = within(groupGrid).getByRole("gridcell", {
    name: /group 1/i,
  });
  const splinteredGroupCell = within(groupGrid).getByRole("gridcell", {
    name: new RegExp(newName),
  });
  const originalMembersTable = within(originalGroupCell).getByRole("table", {
    name: /members/i,
  });
  const expandButtons = screen.getAllByRole("button", {
    name: /group details/i,
  });

  userEvent.click(expandButtons[expandButtons.length - 1]);

  const splinteredMembersTable = within(splinteredGroupCell).getByRole(
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

test("should remove member", () => {
  render(<TabbedDisplay />);

  createAnExpandedParticipantContainer();
  createAnExpandedParticipantContainer();
  createAnExpandedGroupContainer();

  userEvent.click(screen.getByRole("tab", { name: /group/i }));

  const gridEl = screen.getByRole("grid", { name: /groups/i });
  const editorEl = within(gridEl).getByRole("gridcell", { name: /editor/i });
  const tableEl = within(editorEl).getByRole("table");

  userEvent.click(within(editorEl).getByRole("button", { name: /add/i }));

  const memberAdditionModal = screen.getByRole("dialog", {
    name: /participants/i,
  });

  const [firstCheckbox, secondCheckbox] =
    within(memberAdditionModal).getAllByRole("checkbox");
  userEvent.click(firstCheckbox);
  userEvent.click(secondCheckbox);
  userEvent.click(
    within(memberAdditionModal).getByRole("button", { name: /add/i })
  );

  userEvent.click(within(editorEl).getByRole("button", { name: /remove/i }));

  const memberRemovalModal = screen.getByRole("dialog", { name: /member/i });

  userEvent.click(within(memberRemovalModal).getAllByRole("checkbox")[0]);
  userEvent.click(
    within(memberRemovalModal).getByRole("button", { name: /remove/i })
  );

  const participantCount = 1;

  expect(within(tableEl).getAllByRole("row")).toHaveLength(
    tableHeadRowCount + participantCount
  );
});

test("should remove members when selected non-sequentially", () => {
  render(<TabbedDisplay />);

  createAnExpandedParticipantContainer();
  createAnExpandedParticipantContainer();
  createAnExpandedParticipantContainer();
  createAnExpandedGroupContainer();

  userEvent.click(screen.getByRole("tab", { name: /group/i }));

  const grid = screen.getByRole("grid", { name: /groups/i });
  const editor = within(grid).getByRole("gridcell", { name: /editor/i });
  const table = within(editor).getByRole("table");

  userEvent.click(within(editor).getByRole("button", { name: /add/i }));

  const memberAdditionModal = screen.getByRole("dialog", {
    name: /participants/i,
  });
  let [firstCheckbox, secondCheckbox, thirdCheckbox] =
    within(memberAdditionModal).getAllByRole("checkbox");
  userEvent.click(firstCheckbox);
  userEvent.click(secondCheckbox);
  userEvent.click(thirdCheckbox);
  userEvent.click(
    within(memberAdditionModal).getByRole("button", { name: /add/i })
  );

  userEvent.click(within(editor).getByRole("button", { name: /remove/i }));

  const memberRemovalModal = screen.getByRole("dialog", { name: /member/i });

  [firstCheckbox, secondCheckbox, thirdCheckbox] =
    within(memberRemovalModal).getAllByRole("checkbox");

  userEvent.click(thirdCheckbox);
  userEvent.click(firstCheckbox);
  userEvent.click(
    within(memberRemovalModal).getByRole("button", { name: /remove/i })
  );

  expect(
    within(table).getByRole("cell", { name: /participant.*2/i })
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

  test("should not crash when changing distancer to default value", () => {
    render(<TabbedDisplay />);
    userEvent.click(screen.getByRole("tab", { name: /group/i }));
    userEvent.click(screen.getByRole("button", { name: /create group/i }));
    userEvent.click(screen.getByRole("button", { name: /group details/i }));

    expect(() =>
      userEvent.selectOptions(
        screen.getByRole("combobox", { name: /distancer/i }),
        ""
      )
    ).not.toThrowError();
  });
});
