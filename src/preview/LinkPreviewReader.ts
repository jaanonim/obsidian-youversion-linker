import { MarkdownPostProcessorContext } from "obsidian";
import LinkPreviewManager from "./LinkPreview";

export default function linkPreview(
	element: HTMLElement,
	context: MarkdownPostProcessorContext
) {
	const targetLinks = Array.from(element.getElementsByTagName("a")).filter(
		(link) =>
			link.classList.contains("external-link") &&
			link.href !== link.innerHTML &&
			link.href.startsWith("https://www.bible.com/bible")
	);

	for (const link of targetLinks) {
		LinkPreviewManager.processLink(link);
	}
	LinkPreviewManager.clearCache(targetLinks.map((ele) => ele.href));
}
