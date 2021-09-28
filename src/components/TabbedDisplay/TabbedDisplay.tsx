import * as React from "react";

import { Box, Tab, Tabs } from "@mui/material";

import GroupTable from "../GroupTable";
import ParticipantTable from "../ParticipantTable";

import ChaseStartContext from "../../contexts/ChaseStartContext";

import { Group, Participant } from "../../types";

interface State {
  displayedIndex: number;
  groups: Group[];
  participants: Participant[];
}

export default class TabbedDisplay extends React.Component<{}, State> {
  static contextType = ChaseStartContext;

  private static parseChases(groups: Group[]) {
    const chases: Group[][] = [];

    groups.forEach((group) => {
      const { pursuers } = group;
      const distancerId = group.distancer?.id;
      let relativeChase = [];
      const hasRelativeInChase = !!(
        chases.find((chase) => {
          relativeChase = chase;

          return chase.find(({ id: groupId }) => groupId === distancerId);
        }) ||
        chases.find((chase) => {
          relativeChase = chase;

          return chase.find(({ id: groupId }) =>
            pursuers.find(({ id: pursuerId }) => groupId === pursuerId)
          );
        })
      );

      if (hasRelativeInChase) {
        relativeChase.push(group);
      } else {
        chases.push([group]);
      }
    });

    return chases;
  }

  constructor(props: any) {
    super(props);

    this.state = { displayedIndex: 0, groups: [], participants: [] };

    this.handleParticipantsChange = this.handleParticipantsChange.bind(this);
    this.handleGroupsChange = this.handleGroupsChange.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
  }

  componentDidUpdate() {
    this.calculateActions();
  }

  private handleTabChange(evt: React.SyntheticEvent, index: number) {
    this.setState({ displayedIndex: index });
  }

  private handleGroupsChange(newGroups: Group[]) {
    this.setState({ groups: newGroups });
  }

  private handleParticipantsChange(newParticipants: Participant[]) {
    this.setState({ participants: newParticipants });
  }

  private calculateActions() {
    const { groups } = this.state;
    const chases = TabbedDisplay.parseChases(groups);

    const sortParticipants = (
      { derivedSpeed: spd1 }: Participant,
      { derivedSpeed: spd2 }: Participant
    ) => {
      if (spd1 > spd2) {
        return 1;
      }

      if (spd1 < spd2) {
        return -1;
      }

      return 0;
    };

    chases.forEach((chase) => {
      const allParticipants = chase.map(({ participants }) => participants);
      const flatParticipants = allParticipants.reduce(
        (acc, curVal) => acc.concat(curVal),
        []
      );

      flatParticipants.sort(sortParticipants);

      let actionCount = 0;
      let highestDerivedSpeed = flatParticipants[0]?.derivedSpeed - 1 ?? 0;
      flatParticipants.forEach((participant) => {
        const p = participant;

        if (highestDerivedSpeed < p.derivedSpeed) {
          actionCount += 1;
          highestDerivedSpeed = p.derivedSpeed;
        }

        p.actionCount = actionCount;
      });
    });
  }

  private isActive(index: number) {
    const { displayedIndex } = this.state;

    return index === displayedIndex;
  }

  private createGroupTable() {
    const { groups, participants } = this.state;

    return (
      <GroupTable
        warningMessage="No allegiances. No protection. Tsk, tsk..."
        groups={groups}
        participants={participants}
        onGroupsChange={this.handleGroupsChange}
      />
    );
  }

  private createParticipantTable() {
    const { participants } = this.state;

    return (
      <ParticipantTable
        warningMessage="No poor souls for the chase. Still, keep your wits about you."
        participants={participants}
        onParticipantsChange={this.handleParticipantsChange}
      />
    );
  }

  render() {
    const { displayedIndex } = this.state;
    const tabPrefix = "tab";
    const tabPanelPrefix = "tab-panel";
    const displays = [
      { title: "Participants", content: this.createParticipantTable() },
      { title: "Groups", content: this.createGroupTable() },
    ];

    return (
      <Box pt={2}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={displayedIndex}
            onChange={this.handleTabChange}
            selectionFollowsFocus
            variant="fullWidth"
            aria-label="Categories"
          >
            {displays.map((display, index) => (
              <Tab
                id={`${tabPrefix}-${index}`}
                label={display.title}
                role="tab"
                aria-controls={`${tabPanelPrefix}-${index}`}
                aria-selected={this.isActive(index)}
                key={display.title}
              />
            ))}
          </Tabs>
        </Box>
        <div>
          {displays.map((display, index) => {
            return (
              <div
                id={`${tabPanelPrefix}-${index}`}
                hidden={!this.isActive(index)}
                role="tabpanel"
                aria-labelledby={`${tabPrefix}-${index}`}
                key={display.title}
              >
                {display.content}
              </div>
            );
          })}
        </div>
      </Box>
    );
  }
}
