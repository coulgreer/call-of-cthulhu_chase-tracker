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

    this.sequence = new Set<number>([...this.sequence].sort());

    return value;
  }

  private findLowestAvailableValue(): number {
    if (!this.sequence.has(this.start + 1)) return this.start + 1;

    for (let value of this.sequence) {
      let next = value + 1;
      if (!this.sequence.has(next)) return next;
    }

    return this.start;
  }

  remove(value: number) {
    return this.sequence.delete(value);
  }

  get getSequence() {
    return new Set(this.sequence);
  }
}
