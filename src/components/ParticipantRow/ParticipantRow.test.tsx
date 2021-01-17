import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ParticipantRow from "./";

test("should render participant information", () => {
  const name = "Test Participant";

  render(<ParticipantRow defaultParticipantName={name} />);

  expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();
  expect(screen.getByLabelText(ParticipantRow.DEX_TITLE)).toBeInTheDocument();
  expect(screen.getByLabelText(ParticipantRow.MOV_TITLE)).toBeInTheDocument();
});

test("should render given participant name when changed from default name", () => {
  const defaultName = "Default Name";
  const newName = "Test Name";

  render(<ParticipantRow defaultParticipantName={defaultName} />);

  const inputEl = screen.getByRole("textbox", { name: /name/i });
  userEvent.clear(inputEl);
  userEvent.type(inputEl, newName);

  expect(inputEl).toHaveValue(newName);
});

test("should render the last valid name when name changed to empty string", () => {
  const defaultName = "Default Name";
  const validName = "Valid";
  const invalidName = "";

  render(<ParticipantRow defaultParticipantName={defaultName} />);

  const inputEl = screen.getByRole("textbox", { name: /name/i });

  userEvent.clear(inputEl);
  userEvent.type(inputEl, validName);

  userEvent.clear(inputEl);
  userEvent.type(inputEl, invalidName);

  inputEl.blur();

  expect(inputEl).toHaveDisplayValue(validName);
});

test("should render the last valid name when name changed to invalid value with trailing and/or leading spaces", () => {
  const defaultName = "Default Name";
  const validName = "Valid";
  const invalidName = "    ";

  render(<ParticipantRow defaultParticipantName={defaultName} />);

  const inputEl = screen.getByRole("textbox", { name: /name/i });

  userEvent.clear(inputEl);
  userEvent.type(inputEl, validName);

  userEvent.clear(inputEl);
  userEvent.type(inputEl, invalidName);

  inputEl.blur();

  expect(inputEl).toHaveDisplayValue(validName);
});
