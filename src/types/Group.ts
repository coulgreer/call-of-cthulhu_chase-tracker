import Participant from "./Participant";

export default interface Group {
  id: string;
  name: string;
  distancerId: string;
  pursuersIds: string[];
  participants: Participant[];
}
