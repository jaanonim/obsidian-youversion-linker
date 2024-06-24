import booksNames from "../src/BooksLists";
import _books from "../data/books/books.json";

test("Valid books", () => {
	const expectedKeys = [...Object.keys(_books)];
	expectedKeys.sort();
	Object.values(booksNames).forEach((list) => {
		const keys = Object.keys(list);
		keys.sort();
		expect(keys).toStrictEqual(expectedKeys);
		Object.values(list).forEach((names) => {
			names.forEach((n) => {
				expect(typeof n).toBe("string");
			});
		});
	});
});

booksNames;
