import React from "react";

import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Button from ".";

test("should render properly", () => {
  const text = "TEST";

  render(<Button>{text}</Button>);

  const buttonEl = screen.getByRole("button", { name: new RegExp(text) });

  expect(buttonEl).toBeInTheDocument();
  expect(buttonEl).toContainElement(screen.getByTestId("overlay"));
});

test("should use callback when button clicked", () => {
  const oldText = "TEST";
  let newText = "";

  const cb = () => {
    newText = `${oldText}!`;
  };

  render(<Button onClick={cb}>{oldText}</Button>);

  const buttonEl = screen.getByText(new RegExp(oldText));
  userEvent.click(buttonEl);

  expect(newText).toEqual(`${oldText}!`);
});
