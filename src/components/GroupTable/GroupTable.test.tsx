import React from "react";

import { screen, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GroupTable from ".";
import GroupRow from "../GroupRow";
import { Participant } from "../../types";

const DEFAULT_PROPS: { warningMessage: string; participants: Participant[] } = {
  warningMessage: "Warning There's an Error",
  participants: [
    {
      id: "p1",
      name: "Participant 1",
      dexterity: 15,
      movementRate: 6,
      derivedSpeed: 1,
      speedSkills: [],
      hazardSkills: [],
    },
    {
      id: "p2",
      name: "Participant 2",
      dexterity: 50,
      movementRate: 7,
      derivedSpeed: 2,
      speedSkills: [],
      hazardSkills: [],
    },
    {
      id: "p3",
      name: "Participant 3",
      dexterity: 75,
      movementRate: 8,
      derivedSpeed: 3,
      speedSkills: [],
      hazardSkills: [],
    },
  ],
};

describe("Prop Rendering", () => {
  test("should render properly when ommitting all optional props", () => {
    render(<GroupTable />);

    expect(
      screen.getByText(GroupTable.DEFAULT_WARNING_MESSAGE)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create group/i })
    ).toBeInTheDocument();
  });

  test("should render properly when including all optional props", () => {
    const { warningMessage, participants } = DEFAULT_PROPS;

    render(
      <GroupTable warningMessage={warningMessage} participants={participants} />
    );

    expect(screen.getByText(warningMessage)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create group/i })
    ).toBeInTheDocument();
  });
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
    screen.getByRole("button", { name: /delete group/i })
  ).toBeInTheDocument();
});

test("should update group when row adds at least one participant", () => {
  const { participants } = DEFAULT_PROPS;
  const [first, , third] = participants;

  render(<GroupTable participants={participants} />);
  userEvent.click(
    screen.getByRole("button", {
      name: /create group/i,
    })
  );

  const rowEl = screen.getAllByRole("gridcell")[0];

  userEvent.click(within(rowEl).getByRole("button", { name: /expand more/i }));
  userEvent.click(within(rowEl).getByRole("button", { name: /add/i }));
  userEvent.click(
    screen.getByRole("checkbox", { name: new RegExp(first.name) })
  );
  userEvent.click(
    screen.getByRole("checkbox", { name: new RegExp(third.name) })
  );
  userEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: /add/i })
  );

  expect(within(rowEl).getAllByRole("listitem")).toHaveLength(2);
});

describe("Delete Group", () => {
  test("should delete pre-existing group when its associated 'delete' button is pressed", () => {
    render(<GroupTable />);

    const createGroupEl = screen.getByRole("button", { name: /create group/i });
    userEvent.click(createGroupEl);
    userEvent.click(createGroupEl);
    userEvent.click(createGroupEl);

    userEvent.click(
      screen.getByRole("button", {
        name: /delete group-2/i,
      })
    );

    userEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(
      screen.getByRole("button", { name: /delete group-1/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /delete group-2/i,
      })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete group-3/i })
    ).toBeInTheDocument();
  });

  describe("when deletion is canceled", () => {
    test("should preserve group when 'esc' is pressed", () => {
      render(<GroupTable />);

      const createGroupEl = screen.getByRole("button", {
        name: /create group/i,
      });
      userEvent.click(createGroupEl);
      userEvent.click(createGroupEl);
      userEvent.click(createGroupEl);

      userEvent.click(
        screen.getByRole("button", {
          name: /delete group-2/i,
        })
      );

      userEvent.keyboard("{esc}");

      expect(
        screen.getByRole("button", { name: /delete group-1/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /delete group-2/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /delete group-3/i })
      ).toBeInTheDocument();
    });

    test("should preserve group when 'cancel' button is clicked", () => {
      render(<GroupTable />);

      const createGroupEl = screen.getByRole("button", {
        name: /create group/i,
      });
      userEvent.click(createGroupEl);
      userEvent.click(createGroupEl);
      userEvent.click(createGroupEl);

      userEvent.click(
        screen.getByRole("button", {
          name: /delete group-2/i,
        })
      );

      userEvent.click(screen.getByRole("button", { name: /cancel/i }));

      expect(
        screen.getByRole("button", { name: /delete group-1/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /delete group-2/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /delete group-3/i })
      ).toBeInTheDocument();
    });
  });
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
