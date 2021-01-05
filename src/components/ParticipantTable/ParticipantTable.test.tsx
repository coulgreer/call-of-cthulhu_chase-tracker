import React from "react";
import Modal from "react-modal";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";

import ParticipantTable from "./ParticipantTable";

function setupParticipantTableWithModal(warningMessage: string) {
  const div = document.createElement("div");
  document.body.appendChild(div);

  Modal.setAppElement(div);

  return render(<ParticipantTable warningMessage={warningMessage} />, {
    container: div,
  });
}

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

test("Should remove the proper participant When three participants exist", () => {
  setupParticipantTableWithModal("This should not show.");

  const addButton = screen.getByRole("button", { name: /add participant/i });
  userEvent.click(addButton);
  userEvent.click(addButton);
  userEvent.click(addButton);

  userEvent.click(
    screen.getByRole("button", { name: /remove data placeholder 1/i })
  );
  userEvent.click(screen.getByRole("button", { name: /yes/i }));

  expect(screen.queryByText("Placeholder 1")).not.toBeInTheDocument();
  expect(screen.getByText("Placeholder 2")).toBeInTheDocument();
  expect(screen.getByText("Placeholder 3")).toBeInTheDocument();
});

test("Should toggle modal on When 'delete' button is pressed", () => {
  const WARNING_MESSAGE = "This should not show.";
  setupParticipantTableWithModal(WARNING_MESSAGE);

  userEvent.click(screen.getByRole("button", { name: /add participant/i }));
  userEvent.click(
    screen.getByRole("button", { name: /remove data placeholder 1/i })
  );

  expect(screen.queryByText(WARNING_MESSAGE)).not.toBeInTheDocument();
  expect(screen.getByText("Placeholder 1")).toBeInTheDocument();
  expect(screen.getByRole("dialog", { name: /confirm removal/i }))
    .toBeInTheDocument;
});

test("shouldn't remove participant when removal is canceled", () => {
  setupParticipantTableWithModal("This should not show.");

  const addButton = screen.getByRole("button", { name: /add participant/i });
  userEvent.click(addButton);
  userEvent.click(addButton);
  userEvent.click(addButton);

  userEvent.click(
    screen.getByRole("button", { name: /remove data placeholder 1/i })
  );
  userEvent.click(screen.getByRole("button", { name: /cancel/i }));

  expect(screen.getByText("Placeholder 1")).toBeInTheDocument();
  expect(screen.getByText("Placeholder 2")).toBeInTheDocument();
  expect(screen.getByText("Placeholder 3")).toBeInTheDocument();
});

test("shouldn't remove participant when removal is canceled", () => {
  setupParticipantTableWithModal("This should not show.");

  const addButton = screen.getByRole("button", { name: /add participant/i });
  userEvent.click(addButton);
  userEvent.click(addButton);
  userEvent.click(addButton);

  userEvent.click(
    screen.getByRole("button", { name: /remove data placeholder 1/i })
  );
  const modal = screen.getByRole("dialog", { name: /confirm removal/i });
  fireEvent.keyDown(modal, {
    key: "Escape",
    code: "Escape",
    keyCode: 27,
    charCode: 27,
  });

  expect(screen.getByText("Placeholder 1")).toBeInTheDocument();
  expect(screen.getByText("Placeholder 2")).toBeInTheDocument();
  expect(screen.getByText("Placeholder 3")).toBeInTheDocument();
});
