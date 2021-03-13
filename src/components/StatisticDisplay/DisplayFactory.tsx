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
    {
      title,
      currentValue,
      key,
      lowerWarning,
      upperWarning,
    }: StatisticDisplayData,
    handleStatisticChange: (value: string) => void,
    handleStatisticBlur: () => void,
    textboxClassName?: string
  ) {
    return (
      <StatisticDisplay
        className={className}
        textboxClassName={textboxClassName}
        title={title}
        lowerWarning={lowerWarning || DisplayFactory.MIN_PERCENTILE - 1}
        upperWarning={upperWarning || DisplayFactory.MAX_PERCENTILE}
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
