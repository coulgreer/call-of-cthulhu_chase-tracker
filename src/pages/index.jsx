import React from "react";
import SEO from "../components/SEO";

import Layout from "../components/Layout";
import TabbedDisplay from "../components/TabbedDisplay";
import ParticipantTable from "../components/ParticipantTable";

export default function Home() {
  const warningMessage =
    "No poor souls for the chase. Still, keep your wits about you.";
  const participantTable = <ParticipantTable warningMessage={warningMessage} />;

  const displays = [{ title: "Participants", content: participantTable }];

  return (
    <Layout>
      <SEO />
      <TabbedDisplay displays={displays} />
    </Layout>
  );
}
