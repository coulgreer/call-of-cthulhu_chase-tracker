import React from "react";

import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GroupRow from "./GroupRow";

const DEFAULT_PROPS = {
  groups: [
    {
      id: 1,
      name: "Group 1",
      pursuerNames: ["Group 2"],
    },
    {
      id: 2,
      name: "Group 2",
      pursuerNames: ["Group 3"],
    },
    { id: 3, name: "Group 3", pursuerNames: [] },
  ],
};

test("should render properly when details are not expanded", () => {
  const { groups } = DEFAULT_PROPS;

  render(<GroupRow ownedIndex={0} groups={groups} />);

  expect(screen.getByRole("button", { name: /split/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /join/i })).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();

  expect(
    screen.getByRole("button", { name: /expand more/i })
  ).toBeInTheDocument();

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
  expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
});

test("should hide warning and display current distancer when a group has a distancer", () => {
  const { groups } = DEFAULT_PROPS;

  render(<GroupRow ownedIndex={0} groups={groups} />);
  userEvent.click(screen.getByRole("button", { name: /expand more/i }));

  expect(
    screen.getByText(GroupRow.NO_DISTANCER_WARNING_MESSAGE)
  ).not.toBeVisible();
});

test("should hide warning and display current pursuer(s) when a group has any pursuers", () => {
  const { groups } = DEFAULT_PROPS;

  render(<GroupRow ownedIndex={1} groups={groups} />);
  userEvent.click(screen.getByRole("button", { name: /expand more/i }));

  expect(
    screen.getByText(GroupRow.NO_PURSUER_WARNING_MESSAGE)
  ).not.toBeVisible();
});
