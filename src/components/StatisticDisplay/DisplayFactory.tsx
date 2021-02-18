import React from "react";

import StatisticDisplay, { Data as StatisticDisplayData } from ".";

export default class DisplayFactory {
  static get MAX_PERCENTILE() {
    return 100;
  }

  static get MIN_PERCENTILE() {
    return 1;
  }

  static createStatisticDisplay(
    className: string,
    { title, currentValue, key }: StatisticDisplayData,
    onChange: (value: string) => void,
    onBlur: () => void
  ) {
    return (
      <StatisticDisplay
        className={className}
        title={title}
        lowerWarning={DisplayFactory.MIN_PERCENTILE - 1}
        upperWarning={DisplayFactory.MAX_PERCENTILE}
        currentValue={currentValue}
        onChange={onChange}
        onBlur={onBlur}
        key={key}
      />
    );
  }

  private constructor() {
    // do nothing
  }
}
