import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import Modal from "./Modal";

test("Should render properly When 'isShown' is true", () => {
  const isShown = true;
  const title = "The Title";
  const bodyText = "This is the body";
  const body = <p>{bodyText}</p>;

  render(<Modal isShown={isShown} title={title} body={body} />);

  expect(screen.getByRole("dialog", { name: title })).toBeInTheDocument();
  expect(screen.getByText(bodyText)).toBeInTheDocument();
});

test("Should render properly When 'isShown' is false", () => {
  const isShown = false;
  const title = "The Title";
  const bodyText = "This is the body";
  const body = <p>{bodyText}</p>;

  render(<Modal isShown={isShown} title={title} body={body} />);

  expect(screen.queryByRole("dialog", { name: title })).not.toBeInTheDocument();
  expect(screen.queryByText(bodyText)).not.toBeInTheDocument();
});
