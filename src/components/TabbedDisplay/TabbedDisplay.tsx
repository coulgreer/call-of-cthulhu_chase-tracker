import React from "react";

import Button from "../Button";
import GroupTable from "../GroupTable";
import ParticipantTable from "../ParticipantTable";
import ParticipantContainer from "../ParticipantContainer";

import ChaseStartContext from "../../contexts/ChaseStartContext";

import { Group, Participant } from "../../types";

import UniqueSequenceGen from "../../utils/unique-sequence-generator";

import "./TabbedDisplay.css";

interface State {
  displayedIndex: number;
  groups: Group[];
  participants: Participant[];
}

const SEQUENCE_START = 0;

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

  private participantSequenceGenerator;

  constructor(props: any) {
    super(props);

    this.state = { displayedIndex: 0, groups: [], participants: [] };

    this.participantSequenceGenerator = new UniqueSequenceGen(SEQUENCE_START);

    // Participant Table Event Handlers
    this.handleCreateParticipantClick =
      this.handleCreateParticipantClick.bind(this);
    this.handleDeleteParticipantClick =
      this.handleDeleteParticipantClick.bind(this);
    this.handleParticipantChange = this.handleParticipantChange.bind(this);

    // Group Table Event Handlers
    this.handleGroupsChange = this.handleGroupsChange.bind(this);
  }

  componentDidUpdate() {
    this.calculateActions();
  }

  private handleClick(index: number) {
    this.setState({ displayedIndex: index });
  }

  private handleParticipantChange(target: Participant) {
    this.setState((state) => {
      const participants = [...state.participants];

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

    this.setState(({ participants }) => {
      participants.push({
        id,
        name: id,
        dexterity: 15,
        movementRate: 2,
        speedModifier: 1,
        derivedSpeed: 3,
        actionCount: 1,
        speedStatistics: ParticipantContainer.DEFAULT_SPEED_STATISTICS,
        hazardStatistics: ParticipantContainer.DEFAULT_HAZARD_STATISTICS,
        isGrouped: false,
      });

      return { participants };
    });
  }

  private handleDeleteParticipantClick(participant: Participant) {
    this.removeParticipantFromSequence(participant);
    this.removeParticipantFromTable(participant);
  }

  private handleGroupsChange(newGroups: Group[]) {
    this.setState({ groups: newGroups });
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
      <>
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
      </>
    );
  }
}
