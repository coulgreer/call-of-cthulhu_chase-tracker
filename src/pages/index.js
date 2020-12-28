import * as React from "react";

import ParticipantTable from "../components/ParticipantTable";

export default function IndexPage() {
  const WARNING_MESSAGE =
    "Shame. No prey for the chase. Still, keep your wits about you.";

  return <ParticipantTable warningMessage={WARNING_MESSAGE} />;
}
