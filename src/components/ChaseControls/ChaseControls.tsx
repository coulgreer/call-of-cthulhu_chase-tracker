import React, { useContext } from "react";

import clsx from "clsx";

import Button from "../Button";
import ChaseStartContext from "../../contexts/ChaseStartContext";

import "./ChaseControls.css";

interface Props {
  onStartButtonClick?: () => void;
  onStopButtonClick?: () => void;
}

function ChaseControls({ onStartButtonClick, onStopButtonClick }: Props) {
  const hasStarted = useContext(ChaseStartContext);

  return (
    <div className="ChaseControls" role="group" aria-label="chase controls">
      <Button
        className={`button button--large, button--contained button--on-dark ${clsx(
          hasStarted && "ChaseControls--active"
        )}`}
        onClick={onStartButtonClick}
        aria-label="Start"
      >
        <span className="material-icons" aria-hidden>
          play_arrow
        </span>
      </Button>
      <Button
        className={`button button--large, button--contained button--on-dark ${clsx(
          !hasStarted && "ChaseControls--active"
        )}`}
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
