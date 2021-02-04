export default function sanitize(str: string): string {
  const newStr = str.replace(/[^a-z0-9_-]/gim, "");
  return newStr.trim();
}
