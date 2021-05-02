import React from "react";

import Button from "../Button";
import GroupTable from "../GroupTable";
import GroupRow from "../GroupRow";
import ParticipantTable from "../ParticipantTable";
import ParticipantRow from "../ParticipantRow";

import { Group, Participant } from "../../types";

import UniqueSequenceGen from "../../utils/unique-sequence-generator";

import "./TabbedDisplay.css";

interface Props {}

interface State {
  displayedIndex: number;
  groups: Group[];
  participants: Participant[];
}

const SEQUENCE_START = 0;

export default class TabbedDisplay extends React.Component<Props, State> {
  private participantSequenceGenerator;

  private groupSequenceGenerator;

  constructor(props: Props) {
    super(props);

    this.state = { displayedIndex: 0, groups: [], participants: [] };

    this.participantSequenceGenerator = new UniqueSequenceGen(SEQUENCE_START);
    this.groupSequenceGenerator = new UniqueSequenceGen(SEQUENCE_START);

    // Participant Table Event Handlers
    this.handleCreateParticipantClick = this.handleCreateParticipantClick.bind(
      this
    );
    this.handleDeleteParticipantClick = this.handleDeleteParticipantClick.bind(
      this
    );
    this.handleParticipantChange = this.handleParticipantChange.bind(this);

    // Group Table Event Handlers
    this.handleCreateGroupClick = this.handleCreateGroupClick.bind(this);
    this.handleDistancerBlur = this.handleDistancerBlur.bind(this);
    this.handleDeleteGroupClick = this.handleDeleteGroupClick.bind(this);
    this.handleGroupUpdate = this.handleGroupUpdate.bind(this);
  }

  private handleClick(index: number) {
    this.setState({ displayedIndex: index });
  }

  private handleParticipantChange(target: Participant) {
    this.setState((state) => {
      const { participants } = state;
      const targetIndex = participants.findIndex(
        (participant) => participant.id === target.id
      );

      participants[targetIndex] = target;

      return { participants };
    });
  }

  private handleCreateParticipantClick() {
    const idNum = this.participantSequenceGenerator.nextNum();
    const id = `${ParticipantTable.DEFAULT_NAME} #${idNum}`;

    this.setState((state) => {
      const { participants } = state;

      participants.push({
        id,
        name: id,
        dexterity: 15,
        movementRate: 2,
        derivedSpeed: 1,
        speedSkills: ParticipantRow.DEFAULT_SPEED_STATISTICS,
        hazardSkills: ParticipantRow.DEFAULT_HAZARD_STATISTICS,
      });

      return { participants };
    });
  }

  private handleDeleteParticipantClick(participant: Participant) {
    this.removeParticipantFromSequence(participant);
    this.removeParticipantFromTable(participant);
  }

  private handleCreateGroupClick() {
    const idNum = this.groupSequenceGenerator.nextNum();

    this.setState((state) => {
      const { groups } = state;

      groups.push({
        id: `GROUP-${idNum}`,
        name: `Group ${idNum}`,
        distancerId: GroupRow.INVALID_DISTANCER_ID,
        pursuersIds: [],
        participants: [],
      });

      return { groups };
    });
  }

  private handleDeleteGroupClick(index: number) {
    this.setState((state) => {
      const { groups } = state;

      const groupId = groups[index].id;
      const results = groupId.match(new RegExp(/\d+$/)) || [];
      const result = results[0];

      this.groupSequenceGenerator.remove(Number.parseInt(result, 10));
      groups.splice(index, 1);

      return { groups };
    });
  }

  private handleGroupUpdate(newGroup: Group) {
    this.setState((state) => {
      const { groups } = state;

      const index = groups.findIndex((group) =>
        GroupTable.areGroupsEqual(group, newGroup)
      );

      groups.splice(index, 1, newGroup);

      return { groups };
    });
  }

  private handleDistancerBlur(target: Group, distancer: Group | undefined) {
    if (target.distancerId !== GroupRow.INVALID_DISTANCER_ID) {
      this.removeDistancerFrom(target);
    }

    this.addDistancer(target, distancer);
  }

  private removeParticipantFromSequence(participant: Participant) {
    const results = participant.id.match(/[0-9]+$/);

    if (!results) {
      throw Error(
        `The given participant ID -- ${participant.id} -- should be formatted with trailing digits.`
      );
    }

    const idNum = Number.parseInt(results[0], 10);
    this.participantSequenceGenerator.remove(idNum);
  }

  private removeParticipantFromTable(participant: Participant) {
    this.setState((state) => {
      const { participants } = state;
      const targetIndex = participants.indexOf(participant);

      participants.splice(targetIndex, 1);

      return { participants };
    });
  }

  private removeDistancerFrom({ id: targetId, distancerId }: Group) {
    this.setState((state) => {
      const { groups } = state;

      const distancerIndex = groups.findIndex((group) =>
        GroupTable.areGroupsEqual(group.id, distancerId)
      );
      const distancer = groups[distancerIndex];

      const { pursuersIds } = distancer;
      const currentIndex = pursuersIds.findIndex((pursuerId) =>
        GroupTable.areGroupsEqual(pursuerId, targetId)
      );

      distancer.pursuersIds.splice(currentIndex, 1);

      return { groups };
    });
  }

  private addDistancer({ id: targetId }: Group, distancer: Group | undefined) {
    const distancerId = distancer?.id || GroupRow.INVALID_DISTANCER_ID;

    this.setState((state) => {
      const { groups } = state;

      const targetIndex = groups.findIndex((group) =>
        GroupTable.areGroupsEqual(group.id, targetId)
      );
      groups[targetIndex].distancerId = distancerId;

      const distancerIndex = groups.findIndex((group) =>
        GroupTable.areGroupsEqual(group.id, distancerId)
      );
      groups[distancerIndex].pursuersIds.push(targetId);

      return { groups };
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
        onCreateGroupClick={this.handleCreateGroupClick}
        onDeleteGroupClick={this.handleDeleteGroupClick}
        onDistancerBlur={this.handleDistancerBlur}
        onGroupUpdate={this.handleGroupUpdate}
      />
    );
  }

  private createParticipantTable() {
    const { participants } = this.state;

    return (
      <ParticipantTable
        warningMessage="No poor souls for the chase. Still, keep your wits about you."
        participants={participants}
        onCreateParticipantClick={this.handleCreateParticipantClick}
        onDeleteParticipantClick={this.handleDeleteParticipantClick}
        onParticipantChange={this.handleParticipantChange}
      />
    );
  }

  render() {
    const displays = [
      { title: "Participants", content: this.createParticipantTable() },
      { title: "Groups", content: this.createGroupTable() },
    ];

    return (
      <div className="TabbedDisplay">
        <div className="TabbedDisplay__tabs" role="tablist">
          {displays.map((display, index) => (
            <Button
              className={`button button--large TabbedDisplay__tab ${
                this.isActive(index)
                  ? "TabbedDisplay__tab--enabled"
                  : "TabbedDisplay__tab--disabled"
              }`}
              onClick={() => this.handleClick(index)}
              role="tab"
              aria-selected={this.isActive(index)}
              key={display.title}
            >
              {display.title}
            </Button>
          ))}
        </div>
        <div className="TabbedDisplay__displays">
          {displays.map((display, index) => {
            return (
              <div
                hidden={!this.isActive(index)}
                role="tabpanel"
                aria-label={display.title}
                key={display.title}
              >
                {display.content}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
