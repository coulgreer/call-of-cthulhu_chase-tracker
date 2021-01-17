import UniqueSequenceGenerator from "./unique-sequence-generator";

test("should generate next number from starting value", () => {
  const start = 0;
  const sequenceGen = new UniqueSequenceGenerator(start);

  const actual = sequenceGen.nextNum();

  expect(actual).toBe(start + 1);
});

test("should return true when removing existing value in sequence", () => {
  const start = 0;
  const sequenceGen = new UniqueSequenceGenerator(start);

  sequenceGen.nextNum();

  const actual = sequenceGen.remove(start + 1);

  expect(actual).toBeTruthy();
});

test("should return false when removing non-existant value in sequence", () => {
  const start = 0;
  const sequenceGen = new UniqueSequenceGenerator(start);

  const actual = sequenceGen.remove(start + 1);

  expect(actual).toBeFalsy();
})

test("should return all numbers in the sequence", () => {
  const start = 0;
  const sequenceGen = new UniqueSequenceGenerator(start);

  sequenceGen.nextNum();
  sequenceGen.nextNum();
  sequenceGen.nextNum();

  sequenceGen.remove(start + 2);

  const actual = sequenceGen.getSequence;

  const expected = [start + 1, start + 3];
  expect(Array.from(actual)).toEqual(expected);
});

test("should generate the lowest available number", () => {
  const start = 0;
  const sequenceGen = new UniqueSequenceGenerator(start);

  sequenceGen.nextNum();
  sequenceGen.nextNum();
  sequenceGen.nextNum();
  sequenceGen.nextNum();

  sequenceGen.remove(start + 2);
  sequenceGen.remove(start + 3);

  sequenceGen.nextNum();

  const actual = sequenceGen.getSequence;

  const expected = [start + 1, start + 2, start + 4];
  expect(Array.from(actual)).toEqual(expected);
});
