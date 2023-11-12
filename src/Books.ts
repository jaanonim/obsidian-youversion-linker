import _books from "../data/books/books.json";

import _en from "../data/books/en.json";
import _nob from "../data/books/nob.json";
import _pl from "../data/books/pl.json";
import _ptBr from '../data/books/pt-br.json';

const books = _books as {
	[key: string]: string[];
};

const en = _en as {
	[key: string]: string[];
};
const nob = _nob as {
	[key: string]: string[];
};
const pl = _pl as {
	[key: string]: string[];
};

const ptBr = _ptBr as {
	[key: string]: string[];
}

Object.keys(books).forEach((b) => {
	books[b].push(...en[b], ...nob[b], ...pl[b], ...ptBr[b]);
});

export default function getBook(str: string): string | undefined {
	str = str.toLowerCase().replace(/\s/g, "");
	return Object.keys(books).find((key) => books[key].includes(str));
}
