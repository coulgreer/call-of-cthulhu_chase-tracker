import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import ParticipantRow from "./";

test("Should render properly When not expanded", () => {
  const name = "Test Participant";
  const dexTitle = "DEX";
  const movTitle = "MOV";

  render(<ParticipantRow participantName={name} />);

  expect(screen.getByRole("heading", { name: name })).toBeInTheDocument();
  expect(screen.getByLabelText(dexTitle)).toBeInTheDocument();
  expect(screen.getByLabelText(movTitle)).toBeInTheDocument();
});
