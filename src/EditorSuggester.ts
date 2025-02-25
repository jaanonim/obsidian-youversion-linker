import getBooks from "./books/Books";
import {
	bookRegex,
	linkRegex,
	chapterSeparatorRegex,
	rangeSeparatorRegex,
} from "./Regex";
import { ObsidianYouversionLinkerSettings } from "./settings/SettingsData";
import Verse, { VerseElement } from "./verses/Verse";
import VerseLink from "./verses/VerseLink";
import ObsidianYouversionLinker from "./main";
import {
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	TFile,
} from "obsidian";
import {
	makeRegexTypeList,
	makeVerseByType,
	VerseType,
} from "./verses/VerseType";

export class EditorSuggester extends EditorSuggest<VerseLink> {
	constructor(
		private plugin: ObsidianYouversionLinker,
		private settings: ObsidianYouversionLinkerSettings
	) {
		super(plugin.app);
	}

	onTrigger(
		cursor: EditorPosition,
		editor: Editor,
		file: TFile | null
	): EditorSuggestTriggerInfo | null {
		const currentLine = editor.getLine(cursor.line);
		const candidates = makeRegexTypeList(this.settings)
			.map((obj) => ({
				...obj,
				pos: currentLine.search(obj.regex),
			}))
			.filter((obj) => obj.pos >= 0)
			.filter((obj) => obj.pos <= cursor.ch);

		if (candidates.length < 1) return null;

		const typeElement = candidates.sort((a, b) => b.pos - a.pos)[0];
		const pos = typeElement.pos;
		const currentContent = currentLine.substring(pos + 1, cursor.ch).trim();
		const prefix = currentLine.substring(0, pos);
		let type = typeElement.t;
		if (typeElement.tn !== undefined && !prefix.match(/^ {1,3}$/gm)) {
			type = typeElement.tn;
		}

		const matches = currentContent.match(linkRegex);
		if (!matches) return null;
		return matches?.reduce((prev, match) => {
			if (match && prev === null) {
				const end = currentContent.lastIndexOf(match);
				if (end === 0 || currentContent.charAt(end - 1) !== "[") {
					return {
						end: cursor,
						start: {
							line: cursor.line,
							ch: pos,
						},
						query: type + match,
					};
				}
			}
			return null;
		}, null);
	}

	getSuggestions(
		context: EditorSuggestContext
	): VerseLink[] | Promise<VerseLink[]> {
		const query = context.query;

		let verseType = VerseType.LINK;
		const types = Object.values(VerseType) as string[];
		if (types.contains(query[0])) {
			verseType = query[0] as VerseType;
		} else {
			console.error(`INTERNAL: query should start with type char`);
		}

		return getSuggestionsFromQuery(
			query.substring(1),
			verseType,
			this.settings
		);
	}

	renderSuggestion(value: Verse, el: HTMLElement): void {
		value.render(el);
	}

	async selectSuggestion(
		value: Verse,
		evt: MouseEvent | KeyboardEvent
	): Promise<void> {
		if (this.context) {
			const editor = this.context.editor as Editor;
			editor.replaceRange(
				await value.toReplace(),
				this.context.start,
				this.context.end
			);
			const endInsert = await value.endInsert();
			if (endInsert && endInsert.length > 0) {
				const lastLineNumber = editor.lastLine();
				const lastCharNumber = editor.getLine(lastLineNumber).length;
				const pos = {
					line: lastLineNumber,
					ch: lastCharNumber,
				};
				editor.replaceRange(endInsert, pos, pos);
			}
		}
	}
}

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

	const book = query.match(bookRegex)?.first();
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
