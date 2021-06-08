import { nanoid } from "nanoid";

import { createDummyParticipant } from "./participant-factory";
import GroupContainer from "../components/GroupContainer";
import { Group, Participant } from "../types";

let groupIdNumber = 0;

/*
TODO (Coul Greer): Add documentation to all functions in order to help guide
the user.
*/
function generateGroupId() {
  const uuid = nanoid();
  groupIdNumber += 1;

  return `Group-${groupIdNumber}-${uuid}`;
}

export function createGroup(
  id: string,
  name: string,
  distancerId = GroupContainer.getInvalidGroupId(),
  pursuersIds: string[] = [],
  participants: Participant[]
): Group {
  return { id, name, distancerId, pursuersIds, participants };
}

export function createDummyGroupWithParticipants(participants: Participant[]) {
  const id = generateGroupId();

  return createGroup(id, id, undefined, undefined, participants);
}

export function createDummyGroup(): Group {
  const id = generateGroupId();

  const participants = [
    createDummyParticipant(true),
    createDummyParticipant(true),
    createDummyParticipant(true),
  ];

  return createGroup(id, id, undefined, undefined, participants);
}
