import getBook from "./Books";
import { bookRegex, linkRegex, separatorRegex } from "./Regex";
import { ObsidianYouversionLinkerSettings } from "./SettingsData";
import VerseLink from "./VerseLink";
import ObsidianYouversionLinker from "./main";
import {
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	TFile,
} from "obsidian";

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
		const currentContent = editor
			.getLine(cursor.line)
			.substring(0, cursor.ch);

		const matches = currentContent.match(linkRegex);
		if (!matches) return null;
		return matches?.reduce((prev, match) => {
			if (match && prev === null) {
				const end = currentContent.lastIndexOf(match);
				if (end === 0 || currentContent.charAt(end - 1) !== "[")
					return {
						end: cursor,
						start: {
							line: cursor.line,
							ch: end,
						},
						query: match,
					};
			}
			return null;
		}, null);
	}
	getSuggestions(
		context: EditorSuggestContext
	): VerseLink[] | Promise<VerseLink[]> {
		return getSuggestionsFromQuery(context.query, this.settings);
	}

	renderSuggestion(value: VerseLink, el: HTMLElement): void {
		value.render(el);
	}

	selectSuggestion(value: VerseLink, evt: MouseEvent | KeyboardEvent): void {
		if (this.context) {
			(this.context.editor as Editor).replaceRange(
				value.toLink(),
				this.context.start,
				this.context.end
			);
		}
	}
}

export function getSuggestionsFromQuery(
	query: string,
	settings: ObsidianYouversionLinkerSettings
): VerseLink[] {
	console.debug("get suggestion for query ", query.toLowerCase());

	const bookName = query.match(bookRegex)?.first();
	if (!bookName) {
		console.error(`could not find through query`, query);
		return [];
	}

	const bookUrl = getBook(bookName);
	if (!bookUrl) {
		console.error(`could not find book url`, bookName);
		return [];
	}

	const numbersPartsOfQueryString = query.substring(bookName.length);
	const numbers = numbersPartsOfQueryString.split(separatorRegex);

	const chapterNumber = parseInt(numbers[0]);
	const verseNumber = numbers.length > 1 ? parseInt(numbers[1]) : undefined;
	const verseEndNumber =
		numbers.length === 3 ? parseInt(numbers[2]) : undefined;

	return [
		new VerseLink(
			settings.bibleVersion,
			bookUrl,
			bookName,
			chapterNumber,
			verseNumber,
			verseEndNumber
		),
	];
}
