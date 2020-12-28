import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import StatisticDisplay from "./StatisticDisplay";

test("Should properly render When provided with a title and starting value", () => {
  const title = "A Title";
  const startingValue = 5;

  render(<StatisticDisplay title={title} startingValue={startingValue} />);

  expect(screen.getByText(title)).toBeInTheDocument();
  expect(screen.getByLabelText(title).textContent).toBe(
    startingValue.toString()
  );
});
