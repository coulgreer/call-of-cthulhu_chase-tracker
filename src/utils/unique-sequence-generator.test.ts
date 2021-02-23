import UniqueSequenceGenerator from "./unique-sequence-generator";

const start = 0;

test("should generate next number from starting value", () => {
  const sequenceGen = new UniqueSequenceGenerator(start);

  const actual = sequenceGen.nextNum();

  expect(actual).toBe(start + 1);
});

test("should generate the lowest available number", () => {
  const sequenceGen = new UniqueSequenceGenerator(start);
  sequenceGen.nextNum();
  sequenceGen.nextNum();
  sequenceGen.nextNum();
  sequenceGen.nextNum();

  sequenceGen.remove(start + 2);
  sequenceGen.remove(start + 3);
  const val1 = sequenceGen.nextNum();
  const val2 = sequenceGen.nextNum();

  expect(val1).toEqual(start + 2);
  expect(val2).toEqual(start + 3);
});

test("should return all numbers in the sequence", () => {
  const sequenceGen = new UniqueSequenceGenerator(start);
  sequenceGen.nextNum();
  sequenceGen.nextNum();
  sequenceGen.nextNum();

  const actual = sequenceGen.getSequence;

  const expected = [start + 1, start + 2, start + 3];
  expect([...actual]).toEqual(expected);
});

describe("Removal from sequence", () => {
  test("should return true when removing existing value in sequence", () => {
    const sequenceGen = new UniqueSequenceGenerator(start);
    sequenceGen.nextNum();

    const actual = sequenceGen.remove(start + 1);

    expect(actual).toBeTruthy();
  });

  test("should return false when removing non-existant value in sequence", () => {
    const sequenceGen = new UniqueSequenceGenerator(start);

    const actual = sequenceGen.remove(start + 1);

    expect(actual).toBeFalsy();
  });

  test("should return false when removing an undefined value", () => {
    const sequenceGen = new UniqueSequenceGenerator(start);

    const actual = sequenceGen.remove(undefined);

    expect(actual).toBeFalsy();
  });
});

describe("Confirmation Tests", () => {
  test("should properly remove and add back numbers when alphabetic sorting would result in a different order than numeric sorting", () => {
    const sequenceGen = new UniqueSequenceGenerator(start);

    // Add 10+ numbers to the sequence.
    sequenceGen.nextNum();
    sequenceGen.nextNum();
    sequenceGen.nextNum();
    sequenceGen.nextNum();
    sequenceGen.nextNum();
    sequenceGen.nextNum();
    sequenceGen.nextNum();
    sequenceGen.nextNum();
    sequenceGen.nextNum();
    sequenceGen.nextNum();

    // Remove a number that's not at the end of the sequence.
    sequenceGen.remove(1);

    /* Then, remove another number that starts with a differing digit
     *  from the first, but is not at the end of the sequence. */
    sequenceGen.remove(3);

    // Add the two numbers back to the sequence.
    sequenceGen.nextNum();
    sequenceGen.nextNum();

    const actual = sequenceGen.getSequence;

    const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect([...actual]).toEqual(expected);
  });
});
