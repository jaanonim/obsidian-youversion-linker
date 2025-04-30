import booksNames from "../src/books/BooksLists";
import _books from "../data/books/books.json";
import {testBookRegex } from "../src/Regex";
import { cleanBookName } from "../src/books/Books";

test("Valid books", () => {
	const expectedKeys = [...Object.keys(_books)];
	expectedKeys.sort();
	Object.values(booksNames).forEach((list) => {
		const keys = Object.keys(list);
		keys.sort();
		expect(keys).toStrictEqual(expectedKeys);
		Object.values(list).forEach((names) => {
			names.map(cleanBookName).forEach((n) => {
				expect(typeof n).toBe("string");
				expect(n).toMatch(testBookRegex);
			});
		});
	});
});

booksNames;
