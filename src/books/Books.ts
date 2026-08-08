import _books from "../../data/books/books.json";
import {booksNames, type LanguageName} from "./BooksLists";
import { ObsidianYouversionLinkerSettings } from "../settings/SettingsData";

export type BookCode = keyof typeof _books;

let books: Record<BookCode, string[]> | null = null;

export function generateBooksList(settings: ObsidianYouversionLinkerSettings) {
	const activeBooks = _books as Record<BookCode, string[]>;
	const allBooks = booksNames as Record<LanguageName, Record<BookCode, string[]>>;

	settings.selectedBooksLanguages.forEach((lang_name) => {
		const lang = allBooks[lang_name];
		Object.keys(activeBooks).forEach((book) => {
			const names = lang[book as BookCode];
			if (names) {
				activeBooks[book as BookCode].push(...names.map(cleanBookName));
			}
		});
	});
	return activeBooks;
}

export default function getBooks(
	str: string,
	settings: ObsidianYouversionLinkerSettings
): Array<string> {
	str = cleanBookName(str)
	if (books == null) books = generateBooksList(settings);
	return Object.keys(books).filter((key) => books![key as BookCode].includes(str));
}

export function cleanBookName(book: string): string{
	return book.toLowerCase().replace(/\s/g, "");
}
