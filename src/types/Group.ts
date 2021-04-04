import Participant from "./Participant";

export default interface Group {
  id: string;
  name: string;
  distancerName: string;
  pursuersNames: string[];
  participants: Participant;
}
