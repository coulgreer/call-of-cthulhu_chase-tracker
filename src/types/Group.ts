import Participant from "./Participant";

export default interface Group {
  id: string;
  name: string;
  distancer: Group | null;
  pursuers: Group[];
  participants: Participant[];
}
