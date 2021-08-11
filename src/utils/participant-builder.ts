import { nanoid } from "nanoid";

import { Participant, Statistic } from "../types";

export default class ParticipantBuilder {
  private static idNumber = 0;

  private readonly id: string;

  private name: string;

  private dexterity: number;

  private movementRate: number;

  private speedModifier: number;

  private derivedSpeed: number;

  private actionCount: number;

  private speedStatistics: Statistic[];

  private hazardStatistics: Statistic[];

  private isGrouped: boolean;

  constructor() {
    this.id = ParticipantBuilder.generateId();
    this.name = this.id;
    this.dexterity = 15;
    this.movementRate = 8;
    this.speedModifier = 0;
    this.derivedSpeed = this.movementRate + this.speedModifier;
    this.actionCount = 1;
    this.speedStatistics = [];
    this.hazardStatistics = [];
    this.isGrouped = true;
  }

  private static generateId() {
    const uuid = nanoid();

    ParticipantBuilder.idNumber += 1;

    return `Participant-${ParticipantBuilder.idNumber}-${uuid}`;
  }

  private updateDerivedSpeed() {
    this.derivedSpeed = this.movementRate + this.speedModifier;
  }

  withName(name: string) {
    this.name = name;
    return this;
  }

  withDexterity(dex: number) {
    this.dexterity = dex;
    return this;
  }

  withMovementRate(mov: number) {
    this.movementRate = mov;
    this.updateDerivedSpeed();
    return this;
  }

  withSpeedModifier(spdMod: number) {
    this.speedModifier = spdMod;
    this.updateDerivedSpeed();
    return this;
  }

  withActionCount(actionCount: number) {
    this.actionCount = actionCount;
    return this;
  }

  withSpeedStatistics(spdStats: Statistic[]) {
    this.speedStatistics = spdStats;
    return this;
  }

  withHazardStatistics(hzrdStats: Statistic[]) {
    this.hazardStatistics = hzrdStats;
    return this;
  }

  setGrouped(isGrouped: boolean) {
    this.isGrouped = isGrouped;
    return this;
  }

  build(): Participant {
    return {
      id: this.id,
      name: this.name,
      dexterity: this.dexterity,
      movementRate: this.movementRate,
      speedModifier: this.speedModifier,
      derivedSpeed: this.derivedSpeed,
      actionCount: this.actionCount,
      speedStatistics: this.speedStatistics,
      hazardStatistics: this.hazardStatistics,
      isGrouped: this.isGrouped,
    };
  }
}
