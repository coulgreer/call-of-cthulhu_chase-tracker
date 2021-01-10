declare function disableConsoleErrors(): (...data: any[]) => void;

declare function reenableConsoleErrors(
  originalError: (...data: any[]) => void
): void;
