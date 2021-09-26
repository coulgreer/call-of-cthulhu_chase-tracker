import * as React from "react";

import { screen, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ChaseControls from "./ChaseControls";

test("should render properly when given no context", () => {
  render(<ChaseControls />);

  const buttonGroup = screen.getByRole("group", { name: /chase.*controls/i });

  expect(
    within(buttonGroup).getByRole("button", { name: /start/i })
  ).toBeInTheDocument();
  expect(
    within(buttonGroup).getByRole("button", { name: /stop/i })
  ).toHaveClass("ChaseControls--active");
});

test("should trigger onStartButtonClick", () => {
  const handleStartButtonClick = jest.fn();

  render(<ChaseControls onStartButtonClick={handleStartButtonClick} />);

  userEvent.click(screen.getByRole("button", { name: /start/i }));

  expect(handleStartButtonClick).toBeCalledTimes(1);
});

test("should trigger onStopButtonClick", () => {
  const handleStopButtonClick = jest.fn();

  render(<ChaseControls onStopButtonClick={handleStopButtonClick} />);

  userEvent.click(screen.getByRole("button", { name: /stop/i }));

  expect(handleStopButtonClick).toBeCalledTimes(1);
});
