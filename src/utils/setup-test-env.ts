import "@testing-library/jest-dom/extend-expect";

global.disableConsoleErrors = (): ((...data: any[]) => void) => {
  const originalError = console.error;
  console.error = jest.fn();

  return originalError;
};

global.reenableConsoleErrors = (originalError: (...data: any[]) => void) => {
  console.error = originalError;
};
