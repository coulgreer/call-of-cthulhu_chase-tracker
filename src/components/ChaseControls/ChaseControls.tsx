import * as React from "react";

import classnames from "classnames";

import Button from "../Button";
import ChaseStartContext from "../../contexts/ChaseStartContext";

import "./ChaseControls.css";

interface Props {
  onStartButtonClick?: () => void;
  onStopButtonClick?: () => void;
}

function ChaseControls({ onStartButtonClick, onStopButtonClick }: Props) {
  const hasStarted = React.useContext(ChaseStartContext);
  const startButtonClasses = classnames(
    "button",
    "button--medium",
    "button--contained",
    "button--on-dark",
    { "ChaseControls--active": hasStarted }
  );
  const stopButtonClasses = classnames(
    "button",
    "button--medium",
    "button--contained",
    "button--on-dark",
    { "ChaseControls--active": !hasStarted }
  );

  return (
    <div className="ChaseControls" role="group" aria-label="chase controls">
      <Button
        className={startButtonClasses}
        onClick={onStartButtonClick}
        aria-label="Start"
      >
        <span className="material-icons" aria-hidden>
          play_arrow
        </span>
      </Button>
      <Button
        className={stopButtonClasses}
        onClick={onStopButtonClick}
        aria-label="Stop"
      >
        <span className="material-icons" aria-hidden>
          stop
        </span>
      </Button>
    </div>
  );
}

ChaseControls.defaultProps = {
  onStartButtonClick: undefined,
  onStopButtonClick: undefined,
};

export default ChaseControls;
