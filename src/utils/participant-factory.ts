import { nanoid } from "nanoid";

import { Participant, Statistic } from "../types";

let participantIdNumber = 0;

function generateParticipantId() {
  const uuid = nanoid();

  participantIdNumber += 1;

  return `Participant-${participantIdNumber}-${uuid}`;
}

/*
TODO (Coul Greer): Add documentation to all functions in order to help guide
the user.
*/
export function createParticipant(
  id: string,
  name: string,
  dexterity = 15,
  movementRate = 8,
  derivedSpeed = 1,
  speedStatistics: Statistic[] = [],
  hazardStatistics: Statistic[] = [],
  isGrouped: boolean
): Participant {
  return {
    id,
    name,
    dexterity,
    movementRate,
    derivedSpeed,
    speedStatistics,
    hazardStatistics,
    isGrouped,
  };
}

export function createDummyParticipant(
  isGrouped: boolean = false
): Participant {
  const participantId = generateParticipantId();

  return createParticipant(
    participantId,
    participantId,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    isGrouped
  );
}
