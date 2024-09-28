/* A generator used to add the lowest possible value based on the given
  started number. */
export default class UniqueSequenceGenerator {
  private start;

  private sequence;

  /**
   * Creates a simple generator to keep track of unique numerical values. The
   * values are only unique to this sequence.
   * @param start - The value used as the start of the sequence, not inclusive.
   */
  constructor(start: number) {
    this.start = start;
    this.sequence = new Set<number>();
  }

  /** Sequentially generates the next number.
   *  @return The lowest available number in this sequence.
   */
  nextNum() {
    const value = this.findLowestAvailableValue();
    this.sequence.add(value);

    this.sequence = new Set<number>([...this.sequence].sort((a, b) => a - b));

    return value;
  }

  private findLowestAvailableValue(): number {
    const firstValue = this.start + 1;
    if (!this.sequence.has(firstValue)) return firstValue;

    const targetValue = [...this.sequence].find(
      (value) => !this.sequence.has(value + 1)
    );

    return targetValue === undefined ? this.start : targetValue + 1;
  }

  /**
   * Removes the given value from the sequence.
   * @param value - The desired number to remove from the sequnce.
   * @return If the value removed from the sequence.
   */
  remove(value: number | undefined) {
    if (value === undefined) return false;
    return this.sequence.delete(value);
  }

  /** A copy of the numerical sequence. */
  get getSequence() {
    return new Set(this.sequence);
  }
}
