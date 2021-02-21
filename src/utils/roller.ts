const faceCount = 100;

/**
 * A collection of potential results from a simulated die roll. From best
 * degree to worst degree of success:
 * - Critical success
 * - Extreme success
 * - Hard success
 * - Regular success
 * - Failure
 * - Fumble
 */
export enum Result {
  CriticalSuccess,
  ExtremeSuccess,
  HardSuccess,
  RegularSuccess,
  Failure,
  Fumble,
}

/**
 * Generates a success metric, `Result`, based on a randomly generated value
 * and probability.
 * @param value - The value used to derive the thresholds of success.
 */
export function roll(value: number): Result {
  const criticalThreshold = 1;
  const extremeSuccessThreshold = value / 5;
  const hardSuccessThreshold = value / 2;
  const regularSuccessThreshold = value;
  const failureThreshold = value < 50 ? 59 : 99;

  const result = Math.floor(Math.random() * faceCount) + 1;

  if (result > failureThreshold) {
    return Result.Fumble;
  }

  if (result > regularSuccessThreshold) {
    return Result.Failure;
  }

  if (result > hardSuccessThreshold) {
    return Result.RegularSuccess;
  }

  if (result > extremeSuccessThreshold) {
    return Result.HardSuccess;
  }

  if (result > criticalThreshold) {
    return Result.ExtremeSuccess;
  }

  if (result === criticalThreshold) {
    return Result.CriticalSuccess;
  }

  throw new Error(
    `The result, ${result}, is below the critical threshold, ${criticalThreshold}.`
  );
}
