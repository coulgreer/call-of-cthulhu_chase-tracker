import React from "react";

import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GroupRow from "./GroupRow";

test("should render properly when details are not expanded", () => {
  render(<GroupRow />);

  expect(screen.getByRole("button", { name: /split/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /join/i })).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();

  expect(
    screen.getByRole("button", { name: /expand more/i })
  ).toBeInTheDocument();

  expect(
    screen.queryByRole("combobox", { name: /distancer/i })
  ).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/pursuer\(s\)/i)).not.toBeInTheDocument();
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
  render(<GroupRow />);

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
  expect(screen.getByLabelText(/pursuer\(s\)/i)).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /members/i })).toBeInTheDocument();
  expect(screen.getByText(/highest mov/i)).toBeInTheDocument();
  expect(screen.getByText(/lowest mov/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
});
