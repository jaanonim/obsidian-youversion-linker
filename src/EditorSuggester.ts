import { linkRegex } from "./Regex";
import { ObsidianYouversionLinkerSettings } from "./settings/SettingsData";
import Verse from "./verses/Verse";
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
	VerseType,
} from "./verses/VerseType";
import { getSuggestionsFromQuery } from "./Suggestions";

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
