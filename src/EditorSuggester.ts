import getBook from "./Books";
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
		private settings: any
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
		console.log(currentContent);

		const REG = /([123]\s?)?[A-z]+\s?\d{1,3}:\d{1,3}(-\d{1,3})?/;
		const match = currentContent.match(REG)?.first() ?? "";
		if (match) {
			console.log("match");
			return {
				end: cursor,
				start: {
					line: cursor.line,
					ch: currentContent.lastIndexOf(match),
				},
				query: match,
			};
		}
		return null;
	}
	getSuggestions(
		context: EditorSuggestContext
	): VerseLink[] | Promise<VerseLink[]> {
		return this.getSuggestionsFromQuery(context.query, this.settings);
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

	async getSuggestionsFromQuery(
		query: string,
		settings: any
	): Promise<VerseLink[]> {
		console.debug("get suggestion for query ", query.toLowerCase());

		const bookName = query.match(/([123]\s?)?[A-z]+/)?.first();
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
		const numbers = numbersPartsOfQueryString.split(/[-:]+/);

		const chapterNumber = parseInt(numbers[0]);
		const verseNumber = parseInt(numbers[1]);
		const verseEndNumber =
			numbers.length === 3 ? parseInt(numbers[2]) : undefined;

		return [
			new VerseLink(
				this.settings.bibleVersion,
				bookUrl,
				bookName,
				chapterNumber,
				verseNumber,
				verseEndNumber
			),
		];
	}
}
