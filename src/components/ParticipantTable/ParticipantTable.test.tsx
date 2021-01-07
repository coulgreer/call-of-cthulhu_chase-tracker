import React from "react";
import Modal from "react-modal";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";

import ParticipantTable from "./ParticipantTable";

function renderParticipantTableWithModal(warningMessage: string) {
  const div = document.createElement("div");
  document.body.appendChild(div);

  Modal.setAppElement(div);

  return render(<ParticipantTable warningMessage={warningMessage} />, {
    container: div,
  });
}

test("renders an error message when no participants exist", () => {
  const WARNING_MESSAGE =
    "Shame. No prey for the chase. Still, keep your wits about you.";

  render(<ParticipantTable warningMessage={WARNING_MESSAGE} />);

  expect(screen.getByText(WARNING_MESSAGE)).toBeInTheDocument();
});

test("renders a participant instead of an error message when the 'add participant' button is pressed", () => {
  const WARNING_MESSAGE = "This should not show.";
  render(<ParticipantTable warningMessage={WARNING_MESSAGE} />);

  userEvent.click(screen.getByRole("button", { name: /add participant/i }));

  expect(screen.queryByText(WARNING_MESSAGE)).not.toBeInTheDocument();
  expect(screen.getByText("Placeholder1")).toBeInTheDocument();
});

test("removes the designated participant when more than one participant exists", () => {
  renderParticipantTableWithModal("This should not show.");

  const addButton = screen.getByRole("button", { name: /add participant/i });
  userEvent.click(addButton);
  userEvent.click(addButton);
  userEvent.click(addButton);

  const regexrString = "remove data " + ParticipantTable.DEFAULT_NAME + "1";
  userEvent.click(
    screen.getByRole("button", { name: new RegExp(regexrString, "i") })
  );

  userEvent.click(screen.getByRole("button", { name: /yes/i }));

  expect(screen.queryByText("Placeholder1")).not.toBeInTheDocument();
  expect(screen.getByText("Placeholder2")).toBeInTheDocument();
  expect(screen.getByText("Placeholder3")).toBeInTheDocument();
});

test("preserve all participants when removal is canceled via button", () => {
  renderParticipantTableWithModal("This should not show.");

  const addButton = screen.getByRole("button", { name: /add participant/i });
  userEvent.click(addButton);
  userEvent.click(addButton);
  userEvent.click(addButton);

  const regexrString = "remove data " + ParticipantTable.DEFAULT_NAME + "1";
  userEvent.click(
    screen.getByRole("button", { name: new RegExp(regexrString, "i") })
  );
  userEvent.click(screen.getByRole("button", { name: /cancel/i }));

  expect(screen.getByText("Placeholder1")).toBeInTheDocument();
  expect(screen.getByText("Placeholder2")).toBeInTheDocument();
  expect(screen.getByText("Placeholder3")).toBeInTheDocument();
});

test("preserve all participants when removal is canceled via 'esc' key", () => {
  renderParticipantTableWithModal("This should not show.");

  const addButton = screen.getByRole("button", { name: /add participant/i });
  userEvent.click(addButton);
  userEvent.click(addButton);
  userEvent.click(addButton);

  const regexrString = "remove data " + ParticipantTable.DEFAULT_NAME + "1";
  userEvent.click(
    screen.getByRole("button", { name: new RegExp(regexrString, "i") })
  );

  const modal = screen.getByRole("dialog", { name: /confirm removal/i });
  fireEvent.keyDown(modal, {
    key: "Escape",
    code: "Escape",
    keyCode: 27,
    charCode: 27,
  });

  expect(screen.getByText("Placeholder1")).toBeInTheDocument();
  expect(screen.getByText("Placeholder2")).toBeInTheDocument();
  expect(screen.getByText("Placeholder3")).toBeInTheDocument();
});
