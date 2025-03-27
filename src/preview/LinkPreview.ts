import { requestUrl } from "obsidian";
import tippy from "tippy.js";
import { htmlCleanupRegex, htmlDataRegex } from "../Regex";

type CacheElement = {
	info: { version: string; title: string };
	verses: string;
	err: boolean;
};

type CacheType = { [key: string]: CacheElement };

export default class LinkPreviewManager {
	static cache: CacheType = {};

	static async processLink(link: HTMLAnchorElement) {
		const content = await this.processUrl(link.href);

		const popup = document.createElement("div");
		popup.addClass("preview-youversion");

		if (content.err) {
			popup
				.createSpan({ cls: "error-youversion" })
				.setText("Verse preview is unavailable for this link.");
		} else {
			popup
				.createSpan({ cls: "content-youversion" })
				.setText(content.verses);
			popup
				.createSpan({ cls: "info-youversion" })
				.setText(content.info.title + " " + content.info.version);
		}

		tippy(link, { content: popup, allowHTML: true });
	}

	static async processUrl(url: string): Promise<CacheElement> {
		if (!this.cache[url]) {
			try {
				const res = await requestUrl(url);
				let text = await res.text;

				const match = text.match(htmlDataRegex);
				if (match) {
					const json_text = match[0].replace(htmlCleanupRegex, "");

					const data = JSON.parse(json_text);

					if (data.props.pageProps.type !== "verse") {
						throw 1;
					}

					const info = {
						title: data.props.pageProps.referenceTitle.title,
						version:
							data.props.pageProps.version.local_abbreviation,
					};
					const verses = data.props.pageProps.verses
						.map((ele: any) => ele.content)
						.join(" ");

					if (verses.length < 1) {
						throw 1;
					}

					this.cache[url] = { err: false, info, verses };
				} else {
					throw 1;
				}
			} catch {
				this.cache[url] = {
					err: true,
					info: { title: "", version: "" },
					verses: "",
				};
			}
		}
		return this.cache[url];
	}

	static clearCache(notClear: Array<string>) {
		console.debug(
			`Clearing cache... (${Math.abs(
				Object.keys(this.cache).length - notClear.length
			)} items)`
		);
		let dict: CacheType = {};
		notClear.forEach((ele) => {
			dict[ele] = this.cache[ele];
		});
		this.cache = dict;
	}
}
