import * as React from "react";

import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ChaseControls from "./ChaseControls";
import ChaseStartContext from "../../contexts/ChaseStartContext";

function Wrapper(props: { children: React.ReactNode }) {
  const [hasStarted, setHasStarted] = React.useState(false);

  return (
    <ChaseStartContext.Provider value={{ hasStarted, setHasStarted }}>
      {props.children}
    </ChaseStartContext.Provider>
  );
}

test("should render properly when given no context", () => {
  render(<ChaseControls />);

  expect(
    screen.getByRole("button", { name: /start/i })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /stop/i })
  ).not.toBeInTheDocument();
});

test("should render properly when chase started", () => {
  render(
    <Wrapper>
      <ChaseControls />
    </Wrapper>
  );

  userEvent.click(screen.getByRole("button", { name: /start/i }));

  expect(
    screen.queryByRole("button", { name: /start/i })
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /stop/i })
  ).toBeInTheDocument();
});

test("should render properly when chase stopped given it was already in progress", () => {
  render(
    <Wrapper>
      <ChaseControls />
    </Wrapper>
  );
  userEvent.click(screen.getByRole("button", { name: /start/i }));

  userEvent.click(screen.getByRole("button", { name: /stop/i }));

  expect(
    screen.getByRole("button", { name: /start/i })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /stop/i })
  ).not.toBeInTheDocument();
});
