import getBooks from "./books/Books";
import {
	bookRegex,
	chapterSeparatorRegex,
	rangeSeparatorRegex,
} from "./Regex";
import { ObsidianYouversionLinkerSettings } from "./settings/SettingsData";
import Verse, { VerseElement } from "./verses/Verse";
import { makeVerseByType, VerseType } from "./verses/VerseType";

export function processVerses(verses_str: Array<string>): Array<VerseElement> {
	return verses_str
		.map((verse) => {
			const [start, end] = verse
				.split(rangeSeparatorRegex)
				.map((v) => (v === undefined ? undefined : parseInt(v)));
			return start === undefined
				? undefined
				: new VerseElement(start, end);
		})
		.filter((v) => v !== undefined) as Array<VerseElement>;
}

export function getSuggestionsFromQuery(
	query: string,
	verseType: VerseType,
	settings: ObsidianYouversionLinkerSettings
): Verse[] {
	console.debug("get suggestion for query ", query.toLowerCase());

	const book = query.match(bookRegex)?.[0];
	if (!book) {
		console.error(`could not find through query`, query);
		return [];
	}

	const booksUrl = getBooks(book, settings);
	if (!booksUrl.length) {
		console.error(`could not find book url`, book);
		return [];
	}

	const numbersPartsOfQueryString = query.substring(book.length);
	const [chapter_str, ...verses_str] = numbersPartsOfQueryString.split(
		chapterSeparatorRegex
	);
	const verses = processVerses(verses_str);
	const chapter = parseInt(chapter_str);

	return booksUrl.flatMap(
		(bookUrl) =>
			settings.bibleVersions
				.map((version) =>
					makeVerseByType(
						verseType,
						{
							version,
							bookUrl,
							book,
							chapter,
							verses,
						},
						settings
					)
				)
				.filter((v) => v !== undefined) as Verse[]
	);
}
