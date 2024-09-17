import getBooks from "./Books";
import { bookRegex, linkRegex, separatorRegex } from "./Regex";
import { ObsidianYouversionLinkerSettings } from "./SettingsData";
import Verse from "./Verse";
import VerseEmbed from "./VerseEmbed";
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
		const currentLine = editor.getLine(cursor.line);
		const link_pos = currentLine.search(
			new RegExp(this.settings.linkTrigger, "u")
		);
		const embed_pos = currentLine.search(
			new RegExp(this.settings.embedTrigger, "u")
		);

		if (link_pos < 0 && embed_pos < 0) return null;
		const isLink =
			link_pos >= 0 &&
			(cursor.ch - link_pos > cursor.ch - embed_pos || embed_pos < 0);
		const pos = isLink ? link_pos : embed_pos;
		const currentContent = currentLine.substring(pos + 1, cursor.ch).trim();

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
							ch: pos,
						},
						query: (isLink ? "@" : ">") + match,
					};
			}
			return null;
		}, null);
	}

	getSuggestions(
		context: EditorSuggestContext
	): VerseLink[] | Promise<VerseLink[]> {
		const query = context.query;
		const isLink = query[0] !== ">";

		if (query[0] !== "@" && query[0] !== ">") {
			console.error(`INTERNAL: query should start with @ or >`);
		}

		return getSuggestionsFromQuery(
			query.substring(1),
			isLink,
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
			(this.context.editor as Editor).replaceRange(
				await value.toReplace(),
				this.context.start,
				this.context.end
			);
		}
	}
}

export function getSuggestionsFromQuery(
	query: string,
	isLink: boolean,
	settings: ObsidianYouversionLinkerSettings
): Verse[] {
	console.debug("get suggestion for query ", query.toLowerCase());

	const bookName = query.match(bookRegex)?.first();
	if (!bookName) {
		console.error(`could not find through query`, query);
		return [];
	}

	const booksUrl = getBooks(bookName, settings);
	if (!booksUrl.length) {
		console.error(`could not find book url`, bookName);
		return [];
	}

	const numbersPartsOfQueryString = query.substring(bookName.length);		
	const numbers = numbersPartsOfQueryString.split(separatorRegex);
	const verses = numbersPartsOfQueryString.split(':')[1].replaceAll(' ', '').trim() // get verses provide by user
	const chapterNumber = parseInt(numbers[0]);
	const verseNumber = numbers.length > 1 ? parseInt(numbers[1]) : undefined;
	
	return booksUrl.flatMap(
		(bookUrl) =>
			settings.bibleVersions
				.map((version) => {
					if (isLink) {
						return new VerseLink(
							version,
							bookUrl,
							bookName,
							chapterNumber,
							verses
						);
					} else if (verseNumber !== undefined) {
						return new VerseEmbed(
							version,
							bookUrl,
							bookName,
							chapterNumber,
							verses
						);
					}
				})
				.filter((v) => v !== undefined) as Verse[]
	);
}
