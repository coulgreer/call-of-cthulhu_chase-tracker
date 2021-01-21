import * as React from "react";

import Layout from "../components/Layout";
import ParticipantTable from "../components/ParticipantTable";

export default function Home() {
  const warningMessage =
    "Shame. No prey for the chase. Still, keep your wits about you.";

  return (
    <Layout>
      <ParticipantTable warningMessage={warningMessage} />
    </Layout>
  );
}
