import React from "react";

import StatisticDisplay, { WrappedStatistic } from ".";

export default class DisplayFactory {
  static get MAX_PERCENTILE() {
    return 100;
  }

  static get MIN_PERCENTILE() {
    return 1;
  }

  static createStatisticDisplay(
    className: string,
    {
      statistic,
      currentValue,
      limiter = {
        upperLimit: Number.MAX_SAFE_INTEGER,
        upperWarning: DisplayFactory.MAX_PERCENTILE - 1,
        lowerWarning: DisplayFactory.MIN_PERCENTILE + 1,
        lowerLimit: Number.MIN_SAFE_INTEGER,
      },
      key,
    }: WrappedStatistic,
    handleStatisticChange: (value: string) => void,
    handleStatisticBlur: () => void,
    textboxClassName?: string
  ) {
    return (
      <StatisticDisplay
        className={className}
        textboxClassName={textboxClassName}
        title={statistic.name}
        limiter={limiter}
        currentValue={currentValue}
        onStatisticChange={handleStatisticChange}
        onStatisticBlur={handleStatisticBlur}
        key={key}
      />
    );
  }

  private constructor() {
    // do nothing
  }
}
