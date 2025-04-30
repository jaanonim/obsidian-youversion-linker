import _books from "../../data/books/books.json";
import booksNames from "./BooksLists";
import { ObsidianYouversionLinkerSettings } from "../settings/SettingsData";

export type BooksLangList = { [key: string]: { [key: string]: string[] } };

let books: { [key: string]: string[] } | null = null;

export function generateBooksList(settings: ObsidianYouversionLinkerSettings) {
	const booksLocal = _books as {
		[key: string]: string[];
	};

	settings.selectedBooksLanguages.forEach((lang_name) => {
		const lang = booksNames[lang_name];
		Object.keys(booksLocal).forEach((book) => {
			booksLocal[book].push(...lang[book].map(cleanBookName));
		});
	});
	return booksLocal;
}

export default function getBooks(
	str: string,
	settings: ObsidianYouversionLinkerSettings
): Array<string> {
	str = cleanBookName(str)
	if (books == null) {
		books = generateBooksList(settings);
	}
	return Object.keys(books).filter((key) => books![key].includes(str));
}

export function cleanBookName(book: string): string{
	return book.toLowerCase().replace(/\s/g, "");
}
