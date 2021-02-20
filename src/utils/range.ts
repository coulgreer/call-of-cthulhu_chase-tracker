/**
 * This class serves as a utility for keeping track of a range of numeric values.
 */
export default class Range {
  private lowerBound: number;

  private upperBound: number;

  /**
   * Checks two separate ranges to see if they share any values. Any nullish
   * values passed will automatically result in the assumption of no
   * intersection; meaning `false`.
   * @param r1 - The first range to compare with.
   * @param r2 - The second range to compare with.
   */
  static hasIntersection(
    r1: Range | null | undefined,
    r2: Range | null | undefined
  ): boolean {
    if (!r1 || !r2) return false;

    return r1.contains(r2.upperBound) || r1.contains(r2.lowerBound);
  }

  /**
   * Represents a range determined by two boundary values.
   * @param value1 - An endpoint used as a bound for the range.
   * @param value2 - Another endpoint used as another bound for the range.
   */
  constructor(value1: number, value2: number) {
    this.lowerBound = value1 < value2 ? value1 : value2;
    this.upperBound = value1 > value2 ? value1 : value2;
  }

  /** Returns the read-only value of the smallest value in the range.
   *  @return The smallest value with the Range.
   */
  get getLowerBound() {
    return this.lowerBound;
  }

  /** Returns read-only value of the largest value in the range.
   *  @return The largest value within the Range.
   */
  get getUpperBound() {
    return this.upperBound;
  }

  /**
   * Determines if `value` is within this `Range`.
   * @param value - A value to check if it is within the upperBound and
   *     lowerBound.
   * @return If the `value` is within `lowerBound` and `upperBound`.
   */
  contains(value: number) {
    return this.lowerBound <= value && value <= this.upperBound;
  }
}
