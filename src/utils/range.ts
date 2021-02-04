export default class Range {
  private start: number;

  private end: number;

  static hasIntersection(r1: Range | null, r2: Range | null): boolean {
    if (!r1 || !r2) return false;

    return r1.contains(r2.end) || r1.contains(r2.start);
  }

  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }

  get getStart() {
    return this.start;
  }

  get getEnd() {
    return this.end;
  }

  contains(value: number): boolean {
    return (
      (this.start <= value && value <= this.end) ||
      (this.end <= value && value <= this.start)
    );
  }
}
