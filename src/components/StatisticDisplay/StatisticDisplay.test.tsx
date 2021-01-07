import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import StatisticDisplay from "./StatisticDisplay";

test("renders statistics", () => {
  const title = "A Title";
  const startingValue = 5;

  render(<StatisticDisplay title={title} startingValue={startingValue} />);

  expect(screen.getByText(title)).toBeInTheDocument();

  const statisticValue = screen.getByLabelText(title).textContent;
  expect(statisticValue).toBe(startingValue.toString());
});
