import React from "react";

import { screen, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Modal from "./Modal";

test("should show modal", () => {
  render(<Modal isShown />);

  expect(screen.getByRole("dialog")).toBeInTheDocument();
});

test("should hide modal", () => {
  render(<Modal isShown={false} />);

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

describe("Initial State", () => {
  test("should render properly when including all optional props", () => {
    const headerText = "The Head Cheese";
    const Header = <h2>{headerText}</h2>;
    const footerText = "The Bottomline";
    const Footer = <p>{footerText}</p>;
    const contentLabel = "The Dialog Gang";

    render(
      <Modal
        isShown
        Header={Header}
        Footer={Footer}
        contentLabel={contentLabel}
      />
    );

    const modal = screen.getByRole("dialog", { name: contentLabel });

    expect(
      within(modal).getByRole("heading", { name: headerText })
    ).toBeInTheDocument();
    expect(within(modal).getByText(footerText)).toBeInTheDocument();
  });

  test("should render properly when ommitting all optional props", () => {
    render(<Modal isShown />);

    const modal = screen.getByRole("dialog", { name: /modal/i });

    expect(
      within(modal).getByRole("heading", { name: /modal/i })
    ).toBeInTheDocument();
  });

  test("should render children", () => {
    const buttonText = "The Coolest Button You Know";
    const children = <button type="button">{buttonText}</button>;

    render(<Modal isShown>{children}</Modal>);

    const modal = screen.getByRole("dialog");

    expect(
      within(modal).getByRole("button", { name: buttonText })
    ).toBeInTheDocument();
  });
});

test("should request close when esc is pressed", () => {
  const handleCloseRequest = jest.fn();

  render(<Modal isShown onCloseRequest={handleCloseRequest} />);

  userEvent.keyboard("{esc}");

  expect(handleCloseRequest).toBeCalledTimes(1);
});
