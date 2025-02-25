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
			booksLocal[book].push(...lang[book]);
		});
	});
	return booksLocal;
}

export default function getBooks(
	str: string,
	settings: ObsidianYouversionLinkerSettings
): Array<string> {
	str = str.toLowerCase().replace(/\s/g, "");
	if (books == null) {
		books = generateBooksList(settings);
	}
	return Object.keys(books).filter((key) => books![key].includes(str));
}
