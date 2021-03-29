import React from "react";
import SEO from "../components/SEO";

import Layout from "../components/Layout";
import TabbedDisplay from "../components/TabbedDisplay";
import ParticipantTable from "../components/ParticipantTable";
import GroupTable from "../components/GroupTable";

export default function Home() {
  const participantTable = (
    <ParticipantTable warningMessage="No poor souls for the chase. Still, keep your wits about you." />
  );

  const groupTable = <GroupTable warningMessage="warning" />;

  const displays = [
    { title: "Participants", content: participantTable },
    { title: "Groups", content: groupTable },
  ];

  return (
    <Layout>
      <SEO />
      <TabbedDisplay displays={displays} />
    </Layout>
  );
}
