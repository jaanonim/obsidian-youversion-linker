import { requestUrl } from "obsidian";
import tippy from "tippy.js";

type cacheType = { [key: string]: any };

export default class LinkPreviewManager {
	static cache: cacheType = {};

	static async processLink(link: HTMLAnchorElement) {
		if (!this.cache[link.href]) {
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

				try {
					const data = JSON.parse(json_text);

					if (data.props.pageProps.type !== "verse") {
						throw 1;
					}

					const info =
						data.props.pageProps.referenceTitle.title +
						" " +
						data.props.pageProps.version.local_abbreviation;
					const verses = data.props.pageProps.verses
						.map((ele: any) => ele.content)
						.join(" ");
					this.cache[link.href] = { info, verses };
				} catch {
					this.cache[link.href] = { err: true };
				}
			} else {
				this.cache[link.href] = { err: true };
			}
		}

		const popup = document.createElement("div");
		popup.addClass("preview-youversion");

		if (this.cache[link.href].err) {
			popup
				.createSpan({ cls: "error-youversion" })
				.setText("Verse preview is unavailable for this link.");

			return;
		} else {
			popup
				.createSpan({ cls: "content-youversion" })
				.setText(this.cache[link.href]?.verses);
			popup
				.createSpan({ cls: "info-youversion" })
				.setText(this.cache[link.href].info);
		}

		tippy(link, { content: popup, allowHTML: true });
	}

	static clearCache(notClear: Array<string>) {
		let dict: cacheType = {};
		notClear.forEach((ele) => {
			dict[ele] = this.cache[ele];
		});
		this.cache = dict;
	}
}
