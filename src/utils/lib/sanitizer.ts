export function sanitize(str: string): string {
  str = str.replace(/[^a-z0-9_-]/gim, "");
  return str.trim();
}
