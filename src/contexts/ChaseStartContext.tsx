import * as React from "react";

export default React.createContext(
    { hasStarted: false, setHasStarted: (hasStarted: boolean) => { } }
);
