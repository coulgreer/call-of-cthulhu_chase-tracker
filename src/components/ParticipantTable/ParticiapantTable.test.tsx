import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";

import ParticipantTable from "./ParticipantTable";

test("Should show warning When no data to display.", () => {
  const WARNING_MESSAGE =
    "Shame. No prey for the chase. Still, keep your wits about you.";

  render(<ParticipantTable warningMessage={WARNING_MESSAGE} />);

  expect(screen.getByText(WARNING_MESSAGE)).toBeInTheDocument();
});

test("Should generate participants When the add participant button is pressed", () => {
  const WARNING_MESSAGE = "This should not show.";
  render(<ParticipantTable warningMessage={WARNING_MESSAGE} />);

  userEvent.click(screen.getByRole("button", { name: /add participant/i }));

  expect(screen.queryByText(WARNING_MESSAGE)).not.toBeInTheDocument();
  expect(screen.getByText("Placeholder 1")).toBeInTheDocument();
});

test("Should remove the proper participant When two participants exist", () => {
  const WARNING_MESSAGE = "This should not show.";
  render(<ParticipantTable warningMessage={WARNING_MESSAGE} />);

  const addButton = screen.getByRole("button", { name: /add participant/i });
  userEvent.click(addButton);
  userEvent.click(addButton);

  expect(screen.getByText("Placeholder 1")).toBeInTheDocument();
  expect(screen.getByText("Placeholder 2")).toBeInTheDocument();

  userEvent.click(
    screen.getByRole("button", { name: /remove data placeholder 1/i })
  );

  expect(screen.getByText("Placeholder 2")).toBeInTheDocument();
});
