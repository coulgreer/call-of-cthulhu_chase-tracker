import React from "react";

import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GroupTable from ".";

const DEFAULT_PROPS = { warningMessage: "Warning There's an Error" };

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

  const createGroupEl = screen.getByRole("button", { name: /create group/i });

  expect(screen.getByText(warningMessage)).toBeInTheDocument();
  expect(createGroupEl).toBeInTheDocument();

  userEvent.click(createGroupEl);

  expect(screen.queryByText(warningMessage)).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /remove group/i })
  ).toBeInTheDocument();
});

test("should remove pre-existing group when 'remove' button is pressed", () => {
  const { warningMessage } = DEFAULT_PROPS;
  render(<GroupTable warningMessage={warningMessage} />);

  const createGroupEl = screen.getByRole("button", { name: /create group/i });
  userEvent.click(createGroupEl);
  userEvent.click(createGroupEl);
  userEvent.click(createGroupEl);

  expect(
    screen.getByRole("button", { name: /remove group-1/i })
  ).toBeInTheDocument();

  const removeGroupEl = screen.getByRole("button", {
    name: /remove group-2/i,
  });
  expect(removeGroupEl).toBeInTheDocument();

  expect(
    screen.getByRole("button", { name: /remove group-3/i })
  ).toBeInTheDocument();

  userEvent.click(removeGroupEl);

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
