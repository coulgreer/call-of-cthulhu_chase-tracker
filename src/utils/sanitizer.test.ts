import sanitize from "./sanitizer";

test("should remove trailing and leading whitespace", () => {
  const padding = "   ";
  const expected = "TEST";
  const paddedString = padding + expected + padding;

  const actual = sanitize(paddedString);

  expect(actual).toBe(expected);
});

test("should remove any non-alphanumeric characters excluding dashes and underscores", () => {
  const specialCharacters = " !\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
  const unsanitizedString = `Some${specialCharacters}String`;

  const actual = sanitize(unsanitizedString);
  const expected = "Some-_String";

  expect(actual).toBe(expected);
});
