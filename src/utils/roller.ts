const faceCount = 100;

export enum Result {
  CriticalSuccess,
  ExtremeSuccess,
  HardSuccess,
  RegularSuccess,
  Failure,
  Fumble,
}

export function roll(val: number): Result {
  const criticalThreshold = 1;
  const extremeSuccessThreshold = val / 5;
  const hardSuccessThreshold = val / 2;
  const regularSuccessThreshold = val;
  const failureThreshold = val < 50 ? 59 : 99;

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
