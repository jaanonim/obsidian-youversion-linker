import { Editor, MarkdownFileInfo, MarkdownView } from "obsidian";
import { linkRegex } from "./Regex";
import { getSuggestionsFromQuery } from "./EditorSuggester";
import { ObsidianYouversionLinkerSettings } from "./settings/SettingsData";
import Verse from "./verses/Verse";
import { VerseType } from "./verses/VerseType";

export default function GenerateLinks(
	editor: Editor,
	_view: MarkdownView | MarkdownFileInfo,
	settings: ObsidianYouversionLinkerSettings
) {
	const removeDuplicatedSuggestionsHandler = (suggestions: Verse[]) => {
		// remove duplicated suggestions
		suggestions.map((suggestion) => {
			const index = suggestions.indexOf(suggestion);
			if (index >= 0) {
				suggestions = suggestions.slice(index, 1);
			}
		});
		return suggestions;
	};

	const lines = editor.lineCount();
	for (let i = 0; i < lines; i++) {
		const line = editor.getLine(i);

		const match = [...line.matchAll(linkRegex)];
		match.forEach((match) => {
			const suggestions = removeDuplicatedSuggestionsHandler(
				getSuggestionsFromQuery(match[0], VerseType.LINK, settings)
			);
			suggestions.forEach((s) => {
				void s.toReplace().then((replacement) => {
					if (match.index === undefined) return;
					editor.replaceRange(
						replacement,
						{
							line: i,
							ch: match.index,
						},
						{
							line: i,
							ch: match[0].length + match.index,
						}
					);
				});
			});
		});
	}
}
