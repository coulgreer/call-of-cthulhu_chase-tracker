export interface Statistic {
  name: string;
  score: number;
}

export default interface Participant {
  id: string;
  name: string;
  dexterity: number;
  movementRate: number;
  speedModifier: number;
  derivedSpeed: number;
  actionCount: number;
  speedStatistics: Statistic[];
  hazardStatistics: Statistic[];
  isGrouped: boolean;
}
