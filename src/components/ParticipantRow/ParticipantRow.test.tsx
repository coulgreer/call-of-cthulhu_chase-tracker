import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import ParticipantRow from "./";

test("should render participant information", () => {
  const name = "Test Participant";

  render(<ParticipantRow participantName={name} />);

  expect(screen.getByRole("heading", { name: name })).toBeInTheDocument();
  expect(screen.getByLabelText(ParticipantRow.DEX_TITLE)).toBeInTheDocument();
  expect(screen.getByLabelText(ParticipantRow.MOV_TITLE)).toBeInTheDocument();
});
