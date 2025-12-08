import { MarkdownPostProcessorContext } from "obsidian";
import LinkPreviewManager from "./LinkPreview";
import type { VerseFormat } from "src/settings/SettingsData";

export default function linkPreview(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
	formatSettings: VerseFormat
) {
	const targetLinks = Array.from(element.getElementsByTagName("a")).filter(
		(link) =>
			link.classList.contains("external-link") &&
			link.href !== link.innerHTML &&
			link.href.startsWith("https://www.bible.com/bible")
	);

	for (const link of targetLinks) {
		LinkPreviewManager.processLink(link, formatSettings);
	}
	LinkPreviewManager.clearCache(targetLinks.map((ele) => ele.href));
}
