import React from "react";

import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TabbedDisplay from ".";
import ParticipantTable from "../ParticipantTable";

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
  expect(screen.getByText(displayedText2)).not.toBeVisible();
});

test("should switch displays when tab is clicked", () => {
  render(<TabbedDisplay displays={DEFAULT_PROPS.children} />);

  userEvent.click(
    screen.getByRole("button", {
      name: new RegExp(displayedTitle2),
    })
  );

  expect(screen.getByText(displayedText1)).not.toBeVisible();
  expect(screen.getByText(displayedText2)).toBeInTheDocument();
});

test("should throw error when duplicate titles exist", () => {
  const duplicatedTitle = "REPEAT";
  const displays = [
    { title: duplicatedTitle, content: <p>Some text</p> },
    { title: duplicatedTitle, content: <p>Some more text</p> },
  ];

  expect(() => render(<TabbedDisplay displays={displays} />)).toThrowError();
});

describe("Confirmation tests", () => {
  test("should maintain state when tabbed display are switched", () => {
    const displayedTitle3 = "DISPLAY 3";
    const warningText = "Testing";
    const { children } = DEFAULT_PROPS;
    children.push({
      title: displayedTitle3,
      content: <ParticipantTable warningMessage={warningText} />,
    });

    render(<TabbedDisplay displays={children} />);

    userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(displayedTitle3),
      })
    );
    userEvent.click(screen.getByRole("button", { name: /add participant/i }));

    expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();

    userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(displayedTitle2),
      })
    );
    userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(displayedTitle3),
      })
    );

    expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();
  });
});
