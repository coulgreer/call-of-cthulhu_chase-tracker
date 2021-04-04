export interface Statistic {
  name: string;
  score: number;
}

export default interface Participant {
  id: string;
  name: string;
  dexterity: number;
  movementRate: number;
  derivedSpeed: number;
  speedSkills: Statistic[];
  hazardSkills: Statistic[];
}
