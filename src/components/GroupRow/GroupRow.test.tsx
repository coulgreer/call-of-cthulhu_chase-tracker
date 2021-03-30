import React from "react";

import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GroupRow from ".";

const group0Name = "Group 0";
const group1Name = "Group 1";
const group2Name = "Group 2";
const group3Name = "Group 3";

const chaseName = "TEST CHASE";

const DEFAULT_PROPS = {
  groups: [
    {
      id: "0",
      name: group0Name,
      chaseName,
      distancerName: GroupRow.INVALID_DISTANCER_NAME,
      pursuerNames: [],
    },
    {
      id: "1",
      name: group1Name,
      chaseName,
      distancerName: GroupRow.INVALID_DISTANCER_NAME,
      pursuerNames: [group2Name],
    },
    {
      id: "2",
      name: group2Name,
      chaseName,
      distancerName: group1Name,
      pursuerNames: [group3Name],
    },
    {
      id: "3",
      name: group3Name,
      chaseName,
      distancerName: group2Name,
      pursuerNames: [],
    },
  ],
};

/*
 * TODO (Coul Greer): Implement a test to check that the warning message exists
 * when no distancer exists for a group. There is currently a runtime error
 * in which the warning does not appear.
 */

test("should render properly when details are not expanded", () => {
  const { groups } = DEFAULT_PROPS;

  render(<GroupRow ownedIndex={0} groups={groups} />);

  expect(screen.getByRole("button", { name: /split/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /join/i })).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();

  expect(
    screen.getByRole("button", { name: /expand more/i })
  ).toBeInTheDocument();

  expect(screen.queryByText(/chase name/i)).not.toBeInTheDocument();

  expect(
    screen.queryByRole("combobox", { name: /distancer/i })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText(GroupRow.NO_DISTANCER_WARNING_MESSAGE)
  ).not.toBeInTheDocument();

  expect(screen.queryByLabelText(/pursuer\(s\)/i)).not.toBeInTheDocument();
  expect(
    screen.queryByText(GroupRow.NO_PURSUER_WARNING_MESSAGE)
  ).not.toBeInTheDocument();

  expect(
    screen.queryByRole("heading", { name: /members/i })
  ).not.toBeInTheDocument();
  expect(screen.queryByText(/highest mov/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/lowest mov/i)).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/participants/i)).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /add/i })
  ).not.toBeInTheDocument();
});

test("should render properly when details are expanded", () => {
  const { groups } = DEFAULT_PROPS;

  render(<GroupRow ownedIndex={0} groups={groups} />);

  expect(screen.getByRole("button", { name: /split/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /join/i })).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();

  userEvent.click(screen.getByRole("button", { name: /expand more/i }));

  expect(
    screen.getByRole("button", { name: /expand less/i })
  ).toBeInTheDocument();

  expect(screen.getByText(/chase name/i)).toBeInTheDocument();

  expect(
    screen.getByRole("combobox", { name: /distancer/i })
  ).toBeInTheDocument();
  expect(
    screen.getByText(GroupRow.NO_DISTANCER_WARNING_MESSAGE)
  ).toBeInTheDocument();

  expect(screen.getByLabelText(/pursuer\(s\)/i)).toBeInTheDocument();
  expect(
    screen.getByText(GroupRow.NO_PURSUER_WARNING_MESSAGE)
  ).toBeInTheDocument();

  expect(screen.getByRole("heading", { name: /members/i })).toBeInTheDocument();
  expect(screen.getByText(/highest mov/i)).toBeInTheDocument();
  expect(screen.getByText(/lowest mov/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/participants/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
});

describe("Warning Messages", () => {
  test("should show warning message when a group does not have a distancer", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupRow ownedIndex={1} groups={groups} />);
    userEvent.click(screen.getByRole("button", { name: /expand more/i }));

    expect(
      screen.getByText(GroupRow.NO_DISTANCER_WARNING_MESSAGE)
    ).toBeVisible();
  });

  test("should hide warning and display current distancer when a group has a distancer", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupRow ownedIndex={2} groups={groups} />);
    userEvent.click(screen.getByRole("button", { name: /expand more/i }));

    expect(
      screen.getByText(GroupRow.NO_DISTANCER_WARNING_MESSAGE)
    ).not.toBeVisible();
  });

  test("should show warning message when a group does not have at least one pursuer", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupRow ownedIndex={3} groups={groups} />);
    userEvent.click(screen.getByRole("button", { name: /expand more/i }));

    expect(screen.getByText(GroupRow.NO_PURSUER_WARNING_MESSAGE)).toBeVisible();
  });

  test("should hide warning and display current pursuer(s) when a group has any pursuers", () => {
    const { groups } = DEFAULT_PROPS;

    render(<GroupRow ownedIndex={2} groups={groups} />);
    userEvent.click(screen.getByRole("button", { name: /expand more/i }));

    expect(
      screen.getByText(GroupRow.NO_PURSUER_WARNING_MESSAGE)
    ).not.toBeVisible();
  });
});
