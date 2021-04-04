import React from "react";

import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import StatisticTable from ".";

const DEFAULT_PROPS = {
  title: "TEST_TITLE",
  data: [
    { statistic: { name: "title1", score: 1 }, currentValue: "1", key: 1 },
    { statistic: { name: "title2", score: 2 }, currentValue: "2", key: 2 },
  ],
};

test("should render properly", () => {
  const [first, second] = DEFAULT_PROPS.data;
  render(
    <StatisticTable title={DEFAULT_PROPS.title} data={DEFAULT_PROPS.data} />
  );

  expect(
    screen.getByRole("heading", { name: DEFAULT_PROPS.title })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /create statistic/i })
  ).toBeInTheDocument();

  expect(screen.getByLabelText(first.statistic.name)).toBeInTheDocument();
  expect(
    screen.getByRole("button", {
      name: new RegExp(`delete: ${first.statistic.name}`),
    })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", {
      name: new RegExp(`rename: ${first.statistic.name}`),
    })
  ).toBeInTheDocument();

  expect(screen.getByLabelText(second.statistic.name)).toBeInTheDocument();
  expect(
    screen.getByRole("button", {
      name: new RegExp(`delete: ${second.statistic.name}`),
    })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", {
      name: new RegExp(`rename: ${second.statistic.name}`),
    })
  ).toBeInTheDocument();
});

test("should use provided callback", () => {
  const [first] = DEFAULT_PROPS.data;
  const handleCreateClick = jest.fn();
  const handleDeleteClick = jest.fn();
  const handleRenameClick = jest.fn();
  render(
    <StatisticTable
      title={DEFAULT_PROPS.title}
      data={DEFAULT_PROPS.data}
      onCreateClick={handleCreateClick}
      onDeleteClick={handleDeleteClick}
      onRenameStatistic={handleRenameClick}
    />
  );

  userEvent.click(screen.getByRole("button", { name: /create statistic/i }));

  expect(handleCreateClick).toBeCalledTimes(1);

  userEvent.click(
    screen.getByRole("button", {
      name: new RegExp(`delete: ${first.statistic.name}`),
    })
  );

  expect(handleDeleteClick).toBeCalledTimes(1);

  userEvent.click(
    screen.getByRole("button", {
      name: new RegExp(`rename: ${first.statistic.name}`),
    })
  );
  userEvent.click(screen.getByRole("button", { name: /^rename$/i }));

  expect(handleRenameClick).toBeCalledTimes(1);
});

test("should properly display modal", () => {
  const [first] = DEFAULT_PROPS.data;
  render(
    <StatisticTable title={DEFAULT_PROPS.title} data={DEFAULT_PROPS.data} />
  );

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

  userEvent.click(
    screen.getByRole("button", {
      name: new RegExp(`rename: ${first.statistic.name}`),
    })
  );

  expect(screen.getByRole("dialog")).toBeInTheDocument();
});

test("should close modal when cancel button is pressed", () => {
  const [first] = DEFAULT_PROPS.data;
  render(
    <StatisticTable title={DEFAULT_PROPS.title} data={DEFAULT_PROPS.data} />
  );

  userEvent.click(
    screen.getByRole("button", {
      name: new RegExp(`rename: ${first.statistic.name}`),
    })
  );
  userEvent.click(screen.getByRole("button", { name: /cancel/i }));

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("should close modal when accept button is pressed", () => {
  const [first] = DEFAULT_PROPS.data;
  render(
    <StatisticTable title={DEFAULT_PROPS.title} data={DEFAULT_PROPS.data} />
  );

  userEvent.click(
    screen.getByRole("button", {
      name: new RegExp(`rename: ${first.statistic.name}`),
    })
  );
  userEvent.click(screen.getByRole("button", { name: /^rename$/i }));

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
