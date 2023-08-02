import { Editor, MarkdownView } from "obsidian";
import { linkRegex } from "./Regex";
import { getSuggestionsFromQuery } from "./EditorSuggester";
import { ObsidianYouversionLinkerSettings } from "./SettingsData";

export default function GenerateLinks(
	editor: Editor,
	view: MarkdownView,
	settings: ObsidianYouversionLinkerSettings
) {
	const lines = editor.lineCount();
	for (let i = 0; i < lines; i++) {
		const line = editor.getLine(i);

		const match = [...line.matchAll(linkRegex)];
		match.forEach((match) => {
			const suggestions = getSuggestionsFromQuery(match[0], settings);
			suggestions.forEach((s) => {
				if (match.index === undefined) return;
				editor.replaceRange(
					s.toLink(),
					{
						line: i,
						ch: match.index,
					},
					{
						line: i,
						ch: match[0].length + (match.index || 0),
					}
				);
			});
		});
	}
}
