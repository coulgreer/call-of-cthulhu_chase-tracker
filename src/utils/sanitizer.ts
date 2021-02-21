/**
 * Sanitizes the given `string`, so that it may be properly displayed.
 * @param str - The string to be normalize. Strips all trailing whitespace and
 *     any special characters that aren't an underscore or hyphen.
 */
export default function sanitize(str: string): string {
  const newStr = str.replace(/[^a-z0-9_-]/gim, "");
  return newStr.trim();
}
