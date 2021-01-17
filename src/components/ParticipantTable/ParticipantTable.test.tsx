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

describe("Warning Message prop", () => {
  test("should render with an error message when no participants exist", () => {
    const WARNING_MESSAGE =
      "Shame. No prey for the chase. Still, keep your wits about you.";

    render(<ParticipantTable warningMessage={WARNING_MESSAGE} />);

    expect(screen.getByText(WARNING_MESSAGE)).toBeInTheDocument();
  });

  test("should render a participant instead of an error message when a participant exists", () => {
    const WARNING_MESSAGE = "This should not show.";
    render(<ParticipantTable warningMessage={WARNING_MESSAGE} />);

    userEvent.click(screen.getByRole("button", { name: /add participant/i }));

    expect(screen.queryByText(WARNING_MESSAGE)).not.toBeInTheDocument();
    expect(
      screen.getByText(ParticipantTable.DEFAULT_NAME + " #1")
    ).toBeInTheDocument();
  });
});

describe("Participant Removal", () => {
  test("should remove the designated participant", () => {
    renderParticipantTableWithModal("This should not show.");

    const addButton = screen.getByRole("button", { name: /add participant/i });
    userEvent.click(addButton);
    userEvent.click(addButton);
    userEvent.click(addButton);

    const regexrString = "remove: " + ParticipantTable.DEFAULT_NAME + " #1";
    userEvent.click(
      screen.getByRole("button", { name: new RegExp(regexrString, "i") })
    );

    userEvent.click(screen.getByRole("button", { name: /yes/i }));

    expect(
      screen.queryByText(ParticipantTable.DEFAULT_NAME + " #1")
    ).not.toBeInTheDocument();

    expect(
      screen.getByText(ParticipantTable.DEFAULT_NAME + " #2")
    ).toBeInTheDocument();

    expect(
      screen.getByText(ParticipantTable.DEFAULT_NAME + " #3")
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("dialog", { name: /confirm removal/i })
    ).not.toBeInTheDocument();
  });

  test("should preserve all participants when removal is canceled via button", () => {
    renderParticipantTableWithModal("This should not show.");

    const addButton = screen.getByRole("button", { name: /add participant/i });
    userEvent.click(addButton);
    userEvent.click(addButton);
    userEvent.click(addButton);

    const regexrString = "remove: " + ParticipantTable.DEFAULT_NAME + " #1";
    userEvent.click(
      screen.getByRole("button", { name: new RegExp(regexrString, "i") })
    );
    userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(
      screen.getByText(ParticipantTable.DEFAULT_NAME + " #1")
    ).toBeInTheDocument();

    expect(
      screen.getByText(ParticipantTable.DEFAULT_NAME + " #2")
    ).toBeInTheDocument();

    expect(
      screen.getByText(ParticipantTable.DEFAULT_NAME + " #3")
    ).toBeInTheDocument();
  });

  test("should preserve all participants when removal is canceled via 'esc' key", () => {
    renderParticipantTableWithModal("This should not show.");

    const addButton = screen.getByRole("button", { name: /add participant/i });
    userEvent.click(addButton);
    userEvent.click(addButton);
    userEvent.click(addButton);

    const regexrString = "remove: " + ParticipantTable.DEFAULT_NAME + " #1";
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

    expect(
      screen.getByText(ParticipantTable.DEFAULT_NAME + " #1")
    ).toBeInTheDocument();

    expect(
      screen.getByText(ParticipantTable.DEFAULT_NAME + " #2")
    ).toBeInTheDocument();

    expect(
      screen.getByText(ParticipantTable.DEFAULT_NAME + " #3")
    ).toBeInTheDocument();
  });
});

test("should have the appropriate default participant name", () => {
  renderParticipantTableWithModal("TESTING");

  const addButton = screen.getByRole("button", { name: /add participant/i });
  userEvent.click(addButton);
  userEvent.click(addButton);
  userEvent.click(addButton);
  userEvent.click(addButton);

  userEvent.click(
    screen.getByRole("button", {
      name: new RegExp(`remove: ${ParticipantTable.DEFAULT_NAME} #2`, "gim"),
    })
  );
  userEvent.click(screen.getByRole("button", { name: /yes/i }));

  userEvent.click(
    screen.getByRole("button", {
      name: new RegExp(`remove: ${ParticipantTable.DEFAULT_NAME} #4`, "gim"),
    })
  );
  userEvent.click(screen.getByRole("button", { name: /yes/i }));

  userEvent.click(addButton);

  expect(
    screen.getByText(`${ParticipantTable.DEFAULT_NAME} #1`)
  ).toBeInTheDocument();
  expect(
    screen.getByText(`${ParticipantTable.DEFAULT_NAME} #2`)
  ).toBeInTheDocument();
  expect(
    screen.getByText(`${ParticipantTable.DEFAULT_NAME} #3`)
  ).toBeInTheDocument();
  expect(
    screen.queryByText(`${ParticipantTable.DEFAULT_NAME} #4`)
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText(`${ParticipantTable.DEFAULT_NAME} #5`)
  ).not.toBeInTheDocument();
});
