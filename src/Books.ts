import _books from "../data/books/books.json";

import _en from "../data/books/en.json";
import _pl from "../data/books/pl.json";

const books = _books as {
	[key: string]: string[];
};

const en = _en as {
	[key: string]: string[];
};
const pl = _pl as {
	[key: string]: string[];
};

Object.keys(books).forEach((b) => {
	books[b].push(...en[b], ...pl[b]);
});

export default function getBook(str: string): string | undefined {
	str = str.toLowerCase().replace(/\s/g, "");
	return Object.keys(books).find((key) => books[key].includes(str));
}
