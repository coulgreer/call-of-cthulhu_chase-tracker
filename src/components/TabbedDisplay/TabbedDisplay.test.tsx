import React from "react";

import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TabbedDisplay from ".";

const displayedTitle1 = "DISPLAY 1";
const displayedText1 = "Some displayed text";

const displayedTitle2 = "DISPLAY 2";
const displayedText2 = "Some more displayed text";

const DEFAULT_PROPS = {
  children: [
    { title: displayedTitle1, content: <h2>{displayedText1}</h2> },
    { title: displayedTitle2, content: <p>{displayedText2}</p> },
  ],
};

test("should render properly", () => {
  render(<TabbedDisplay displays={DEFAULT_PROPS.children} />);

  expect(
    screen.getByRole("button", {
      name: new RegExp(displayedTitle1),
    })
  ).toHaveClass("TabbedDisplay__tab--enabled");
  expect(
    screen.getByRole("button", {
      name: new RegExp(displayedTitle2),
    })
  ).toHaveClass("TabbedDisplay__tab--disabled");

  expect(screen.getByText(displayedText1)).toBeInTheDocument();
  expect(screen.queryByText(displayedText2)).not.toBeInTheDocument();
});

test("should switch displays when tab is clicked", () => {
  render(<TabbedDisplay displays={DEFAULT_PROPS.children} />);

  userEvent.click(
    screen.getByRole("button", {
      name: new RegExp(displayedTitle2),
    })
  );

  expect(screen.queryByText(displayedText1)).not.toBeInTheDocument();
  expect(screen.getByText(displayedText2)).toBeInTheDocument();
});
