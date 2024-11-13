import * as React from "react";

import { ToggleButton, ToggleButtonGroup } from "@mui/material";

import ChaseStartContext from "../../contexts/ChaseStartContext";

function ChaseControls() {
  const { hasStarted, setHasStarted } = React.useContext(ChaseStartContext);

  return (
    <ToggleButtonGroup
      color="secondary"
      value={hasStarted}
      exclusive
      size="large"
      fullWidth
      aria-label="Chase controls"
    >
      {!hasStarted
        ? (
          <ToggleButton
            value={true}
            onClick={() => { setHasStarted(true) }}
            aria-label="Start"
          >
            <span className="material-icons" aria-hidden>
              play_arrow
            </span>
          </ToggleButton>
        ) : (
          <ToggleButton
            value={false}
            onClick={() => { setHasStarted(false) }}
            aria-label="Stop">
            <span className="material-icons" aria-hidden>
              stop
            </span>
          </ToggleButton>
        )
      }
    </ToggleButtonGroup>
  );
}

export default ChaseControls;
