export default class UniqueSequenceGenerator {
  private start;

  private sequence;

  constructor(start: number) {
    this.start = start;
    this.sequence = new Set<number>();
  }

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

  remove(value: number) {
    return this.sequence.delete(value);
  }

  get getSequence() {
    return new Set(this.sequence);
  }
}
