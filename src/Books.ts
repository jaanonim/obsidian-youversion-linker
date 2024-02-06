import _books from "../data/books/books.json";

import _en from "../data/books/en.json";
import _nob from "../data/books/nob.json";
import _pl from "../data/books/pl.json";
import _ptBr from "../data/books/pt-br.json";
import _de from "../data/books/de.json";
import _zhCN from "../data/books/zh_CN.json"
import _zhHK from "../data/books/zh_HK.json"

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
};
const de = _de as {
	[key: string]: string[];
};
const cn = _zhCN as {
	[key: string]: string[];
};
const hk = _zhHK as {
	[key: string]: string[];
};


Object.keys(books).forEach((b) => {
	books[b].push(...en[b], ...nob[b], ...pl[b], ...ptBr[b], ...de[b],...zh[b],...hk[b] );
});

export default function getBooks(str: string): Array<string> {
	str = str.toLowerCase().replace(/\s/g, "");
	return Object.keys(books).filter((key) => books[key].includes(str));
}
