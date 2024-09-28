import { nanoid } from "nanoid";

import { Group, Participant } from "../types";

export default class GroupBuilder {
  private static idNumber = 0;

  private readonly id: string;

  private name: string;

  private distancer: Group | null;

  private pursuers: Group[];

  private participants: Participant[];

  constructor() {
    this.id = GroupBuilder.generateId();
    this.name = this.id;
    this.distancer = null;
    this.pursuers = [];
    this.participants = [];
  }

  private static generateId() {
    const uuid = nanoid();

    GroupBuilder.idNumber += 1;

    return `Participant-${GroupBuilder.idNumber}-${uuid}`;
  }

  withName(name: string) {
    this.name = name;
    return this;
  }

  withDistancer(distancer: Group | null) {
    this.distancer = distancer;
    return this;
  }

  withPursuers(pursuers: Group[]) {
    this.pursuers = pursuers;
    return this;
  }

  withParticipants(participants: Participant[]) {
    this.participants = participants;
    return this;
  }

  build(): Group {
    return {
      id: this.id,
      name: this.name,
      distancer: this.distancer,
      pursuers: this.pursuers,
      participants: this.participants,
    };
  }
}
