import React from "react";

import { screen, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GroupTable from ".";
import GroupRow from "../GroupRow";

const DEFAULT_PROPS = { warningMessage: "Warning There's an Error" };

describe("Prop Rendering", () => {
  describe("Default Props", () => {
    test("should render properly when no groups exist", () => {
      render(<GroupTable />);

      expect(
        screen.getByText(GroupTable.DEFAULT_WARNING_MESSAGE)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create group/i })
      ).toBeInTheDocument();
    });

    test("should render properly when a group is created", () => {
      render(<GroupTable />);

      userEvent.click(
        screen.getByRole("button", {
          name: /create group/i,
        })
      );

      expect(
        screen.queryByText(GroupTable.DEFAULT_WARNING_MESSAGE)
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /remove group/i })
      ).toBeInTheDocument();
    });
  });

  describe("Given Props", () => {
    test("should render properly when no groups exist", () => {
      const { warningMessage } = DEFAULT_PROPS;

      render(<GroupTable warningMessage={warningMessage} />);

      expect(screen.getByText(warningMessage)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create group/i })
      ).toBeInTheDocument();
    });

    test("should render properly when a group is created", () => {
      const { warningMessage } = DEFAULT_PROPS;

      render(<GroupTable warningMessage={warningMessage} />);

      userEvent.click(
        screen.getByRole("button", {
          name: /create group/i,
        })
      );

      expect(screen.queryByText(warningMessage)).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /remove group/i })
      ).toBeInTheDocument();
    });
  });
});

test("should remove pre-existing group when its associated 'remove' button is pressed", () => {
  render(<GroupTable />);

  const createGroupEl = screen.getByRole("button", { name: /create group/i });
  userEvent.click(createGroupEl);
  userEvent.click(createGroupEl);
  userEvent.click(createGroupEl);

  userEvent.click(
    screen.getByRole("button", {
      name: /remove group-2/i,
    })
  );

  expect(
    screen.getByRole("button", { name: /remove group-1/i })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", {
      name: /remove group-2/i,
    })
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /remove group-3/i })
  ).toBeInTheDocument();
});

test("should update pursuers list when another group makes it its distancer", () => {
  render(<GroupTable />);
  const name1 = "GROUP-1";
  const name2 = "GROUP-2";
  const name3 = "GROUP-3";

  const createGroupEl = screen.getByRole("button", { name: /create group/i });
  userEvent.click(createGroupEl);
  userEvent.click(createGroupEl);
  userEvent.click(createGroupEl);

  expect(screen.queryByRole("listitem")).not.toBeInTheDocument();

  const [firstRow, secondRow, thirdRow] = screen.getAllByRole("row");
  userEvent.click(
    within(firstRow).getByRole("button", { name: /expand more/i })
  );
  userEvent.click(
    within(secondRow).getByRole("button", { name: /expand more/i })
  );
  userEvent.click(
    within(thirdRow).getByRole("button", { name: /expand more/i })
  );

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

describe("Focus Trap", () => {
  test("should trap focus when 'enter' key is pressed", () => {
    render(<GroupTable />);

    const createGroupEl = screen.getByRole("button", { name: /create group/i });
    userEvent.click(createGroupEl);

    userEvent.click(screen.getByRole("button", { name: /expand more/i }));

    const gridcellEl = screen.getAllByRole("gridcell")[0];
    const rowEl = screen.getByRole("row");

    gridcellEl.focus();
    userEvent.tab({ shift: true });

    expect(rowEl).toHaveFocus();

    userEvent.type(gridcellEl, "{enter}");

    expect(gridcellEl).toHaveFocus();

    userEvent.tab({ shift: true });

    expect(rowEl).not.toHaveFocus();
    expect(gridcellEl).not.toHaveFocus();
  });

  test("should release focus trap when 'esc' key is pressed", () => {
    render(<GroupTable />);

    const createGroupEl = screen.getByRole("button", { name: /create group/i });
    userEvent.click(createGroupEl);

    userEvent.click(screen.getByRole("button", { name: /expand more/i }));

    const gridcellEl = screen.getAllByRole("gridcell")[0];
    userEvent.type(gridcellEl, "{enter}");
    userEvent.type(gridcellEl, "{esc}");

    expect(gridcellEl).toHaveFocus();

    userEvent.tab({ shift: true });

    expect(screen.getByRole("row")).toHaveFocus();
    expect(gridcellEl).not.toHaveFocus();
  });
});

describe("Confirmation Tests", () => {
  test("should render 'no distancer' warning when row is initially added", () => {
    const { warningMessage } = DEFAULT_PROPS;
    render(<GroupTable warningMessage={warningMessage} />);
    userEvent.click(screen.getByRole("button", { name: /create group/i }));
    userEvent.click(screen.getByRole("button", { name: /expand more/i }));

    expect(
      screen.getByText(GroupRow.NO_DISTANCER_WARNING_MESSAGE)
    ).toBeVisible();
  });
});
