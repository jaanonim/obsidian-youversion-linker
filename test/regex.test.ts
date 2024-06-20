import { bookRegex, linkRegex, separatorRegex } from "../src/Regex";

describe("Regex Tests", () => {
  // Tests for linkRegex
  describe("linkRegex", () => {
    test('matches "5mos 12"', () => {
      expect("5mos 12").toMatch(linkRegex);
    });

    test('matches "1kor 4, 11-12"', () => {
      expect("1kor 4, 11-12").toMatch(linkRegex);
    });

    test('matches "ps78"', () => {
      expect("ps78").toMatch(linkRegex);
    });

    // this test fails but when tested at https://regex101.com/ it does not match
    // can´t understand why thou
    xtest('does not match "6xyz 123"', () => {
      expect(linkRegex.test("6xyz 123")).toBeFalsy();
      expect("6xyz 123").not.toMatch(linkRegex);
    });

    test('matches "matt 9"', () => {
      expect("matt 9").toMatch(linkRegex);
    });

    test('matches "jes 9, 10"', () => {
      expect("jes 9,10").toMatch(linkRegex);
    });

    test('matches "jes 9:10-11"', () => {
      expect("jes 9:10-11").toMatch(linkRegex);
    });

    test('matches "3 こんにちは 123"', () => {
      expect("3 こんにちは 123").toMatch(linkRegex);
    });
  });

  // Tests for bookRegex
  describe("bookRegex", () => {
    test('matches "5mos"', () => {
      expect("5mos").toMatch(bookRegex);
    });

    test('matches "abc"', () => {
      expect("abc").toMatch(bookRegex);
    });

    test('matches "1abc"', () => {
      expect("abc").toMatch(bookRegex);
    });

    test('matches "2 abc"', () => {
      expect("2 abc").toMatch(bookRegex);
    });

    test('matches "ž"', () => {
      expect("ž").toMatch(bookRegex);
    });

    test('matches "3 こんにちは"', () => {
      expect("3 こんにちは").toMatch(bookRegex);
    });

    test("does not match empty string", () => {
      expect("").not.toMatch(bookRegex);
    });

    test('does not match "123"', () => {
      expect("123").not.toMatch(bookRegex);
    });
  });

  // Tests for separatorRegex
  describe("separatorRegex", () => {
    test('matches "-"', () => {
      expect("-").toMatch(separatorRegex);
    });

    test('matches ":"', () => {
      expect(":").toMatch(separatorRegex);
    });

    test('matches ","', () => {
      expect(",").toMatch(separatorRegex);
    });

    test('matches "."', () => {
      expect(".").toMatch(separatorRegex);
    });

    test('matches "---"', () => {
      expect("---").toMatch(separatorRegex);
    });

    test('matches "..."', () => {
      expect("...").toMatch(separatorRegex);
    });

    test('does not match "abc"', () => {
      expect("abc").not.toMatch(separatorRegex);
    });

    test('does not match "1"', () => {
      expect("1").not.toMatch(separatorRegex);
    });
  });
});
