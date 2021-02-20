import Range from "./range";

test("should return a larger upper bound than the lower bound when the first value is less than the second value", () => {
  const start = 5;
  const end = start + 1;
  const range = new Range(start, end);

  expect(range.getLowerBound < range.getUpperBound).toBeTruthy();
});

test("should return a larger upper bound than the lower bound when the first value is greater than the second value", () => {
  const start = 5;
  const end = start - 1;
  const range = new Range(start, end);

  expect(range.getLowerBound < range.getUpperBound).toBeTruthy();
});

describe("Intersection checking", () => {
  test("should return true when 2 ranges overlap", () => {
    const start1 = 0;
    const end1 = 5;

    const start2 = start1 - 2;
    const end2 = start1 + 2;

    const range1 = new Range(start1, end1);
    const range2 = new Range(start2, end2);

    const actual = Range.hasIntersection(range1, range2);

    expect(actual).toBeTruthy();
  });

  test("should return true when 2 ranges' upper bound and lower bound overlap", () => {
    const start1 = 0;
    const end1 = 5;

    const start2 = start1 - 2;
    const end2 = start1;

    const range1 = new Range(start1, end1);
    const range2 = new Range(start2, end2);

    const actual = Range.hasIntersection(range1, range2);

    expect(actual).toBeTruthy();
  });

  test("should return false when at least one range is null", () => {
    const range1 = null;
    const range2 = new Range(0, 7);

    const actual = Range.hasIntersection(range1, range2);

    expect(actual).toBeFalsy();
  });

  test("should return false when at least one range is undefined", () => {
    const range1 = undefined;
    const range2 = new Range(0, 7);

    const actual = Range.hasIntersection(range1, range2);

    expect(actual).toBeFalsy();
  });
});

describe("Contains: Boundary Value Analysis", () => {
  const lowerBound = 0;
  const upperBound = 5;
  const range = new Range(lowerBound, upperBound);

  test("should return false when value is less than lower bound", () => {
    const value = lowerBound - 1;

    const actual = range.contains(value);

    expect(actual).toBeFalsy();
  });

  test("should return true when value is equal to lower bound", () => {
    const value = lowerBound;

    const actual = range.contains(value);

    expect(actual).toBeTruthy();
  });

  test("should return true when value is greater than lower bound", () => {
    const value = lowerBound + 1;

    const actual = range.contains(value);

    expect(actual).toBeTruthy();
  });

  test("should return true when value is less than upper bound", () => {
    const value = upperBound - 1;

    const actual = range.contains(value);

    expect(actual).toBeTruthy();
  });

  test("should return true when value is equal to upper bound", () => {
    const value = upperBound;

    const actual = range.contains(value);

    expect(actual).toBeTruthy();
  });

  test("should return false when value is greater than upper bound", () => {
    const value = upperBound + 1;

    const actual = range.contains(value);

    expect(actual).toBeFalsy();
  });
});
