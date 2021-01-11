import Range from "./range";

test("should return true when start is less than end and inside range", () => {
  const start = 2;
  const end = 5;
  const value = 3;
  const range = new Range(start, end);

  const actual = range.contains(value);

  expect(actual).toBeTruthy();
});

test("should return true when start is greater than end and inside range", () => {
  const start = 5;
  const end = 2;
  const value = 3;
  const range = new Range(start, end);

  const actual = range.contains(value);

  expect(actual).toBeTruthy();
});

test("should return true when 2 ranges intersect", () => {
  const range1 = new Range(0, 11);
  const range2 = new Range(5, 19);

  const actual = Range.hasIntersection(range1, range2);

  expect(actual).toBeTruthy();
});

test("should return false when at least one range is null", () => {
  const range1 = null;
  const range2 = null;

  const actual = Range.hasIntersection(range1, range2);

  expect(actual).toBeFalsy();
});

describe("Boundary Value Analysis", () => {
  test("should return false when outside lower bound", () => {
    const start = 2;
    const end = 5;
    const value = start - 1;
    const range = new Range(start, end);

    const actual = range.contains(value);

    expect(actual).toBeFalsy();
  });

  test("should return false when less than lower bound", () => {
    const start = 2;
    const end = 5;
    const value = start - 1;
    const range = new Range(start, end);

    const actual = range.contains(value);

    expect(actual).toBeFalsy();
  });

  test("should return true when at lower bound", () => {
    const start = 2;
    const end = 5;
    const value = start;
    const range = new Range(start, end);

    const actual = range.contains(value);

    expect(actual).toBeTruthy();
  });

  test("should return true when greater than lower bound", () => {
    const start = 2;
    const end = 5;
    const value = start + 1;
    const range = new Range(start, end);

    const actual = range.contains(value);

    expect(actual).toBeTruthy();
  });

  test("should return true when greater than upper bound", () => {
    const start = 2;
    const end = 5;
    const value = end - 1;
    const range = new Range(start, end);

    const actual = range.contains(value);

    expect(actual).toBeTruthy();
  });

  test("should return true when at upper bound", () => {
    const start = 2;
    const end = 5;
    const value = start;
    const range = new Range(start, end);

    const actual = range.contains(value);

    expect(actual).toBeTruthy();
  });

  test("should return false when greater than upper bound", () => {
    const start = 2;
    const end = 5;
    const value = end + 1;
    const range = new Range(start, end);

    const actual = range.contains(value);

    expect(actual).toBeFalsy();
  });
});
