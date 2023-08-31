import { MarkdownPostProcessorContext, requestUrl } from "obsidian";
import tippy from "tippy.js";

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
		processLink(link);
	}
}

async function processLink(link: HTMLAnchorElement) {
	const res = await requestUrl(link.href);
	let text = await res.text;

	const match = text.match(
		/<script\s*id="__NEXT_DATA__"\s*type="application\/json"\s*>.+?(?=<\/script>\s*<\/body>\s*<\/html>)/
	);
	if (match) {
		const json_text = match[0].replace(
			/<script\s*id="__NEXT_DATA__"\s*type="application\/json"\s*>/,
			""
		);
		const data = JSON.parse(json_text);

		if (data.props.pageProps.type !== "verse") {
			const popup = document.createElement("div");
			popup.addClass("preview-youversion");

			popup
				.createSpan({ cls: "error-youversion" })
				.setText("Verse preview is unavailable for this type of link.");

			tippy(link, { content: popup, allowHTML: true });
			return;
		}

		const info =
			data.props.pageProps.referenceTitle.title +
			" " +
			data.props.pageProps.version.local_abbreviation;
		const verses = data.props.pageProps.verses
			.map((ele: any) => ele.content)
			.join(" ");

		const popup = document.createElement("div");
		popup.addClass("preview-youversion");

		popup.createSpan({ cls: "content-youversion" }).setText(verses);
		popup.createSpan({ cls: "info-youversion" }).setText(info);

		tippy(link, { content: popup, allowHTML: true });
	}
}
