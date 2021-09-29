import * as React from "react";

import { ToggleButton, ToggleButtonGroup } from "@mui/material";

import ChaseStartContext from "../../contexts/ChaseStartContext";

interface Props {
  onStartButtonClick?: () => void;
  onStopButtonClick?: () => void;
}

function ChaseControls({ onStartButtonClick, onStopButtonClick }: Props) {
  const hasStarted = React.useContext(ChaseStartContext);

  return (
    <ToggleButtonGroup
      color="secondary"
      value={hasStarted}
      exclusive
      size="large"
      fullWidth
      aria-label="Chase controls"
    >
      <ToggleButton
        value={true}
        onClick={onStartButtonClick}
        aria-label="Start"
      >
        <span className="material-icons" aria-hidden>
          play_arrow
        </span>
      </ToggleButton>
      <ToggleButton value={false} onClick={onStopButtonClick} aria-label="Stop">
        <span className="material-icons" aria-hidden>
          stop
        </span>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

ChaseControls.defaultProps = {
  onStartButtonClick: undefined,
  onStopButtonClick: undefined,
};

export default ChaseControls;
