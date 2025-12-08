import { requestUrl } from "obsidian";
import tippy from "tippy.js";
import { htmlCleanupRegex, htmlDataRegex } from "../Regex";
import type { VerseFormat } from "src/settings/SettingsData";

type CacheElement = {
	info: { version: string; title: string };
	verses: string;
	err: boolean;
};

type CacheType = { [key: string]: CacheElement };

export default class LinkPreviewManager {
	static cache: CacheType = {};

	static async processLink(link: HTMLAnchorElement, formatSettings: VerseFormat) {
		const content = await this.processUrl(link.href, formatSettings);

		const popup = document.createElement("div");
		popup.addClass("preview-youversion");

		if (content.err) {
			popup
				.createSpan({ cls: "error-youversion" })
				.setText("Verse preview is unavailable for this link.");
		} else {
			// Format verses using plugin settings if available so preview matches embeds
			try {
				// Lazy import of formatting util to avoid circular imports
				// eslint-disable-next-line @typescript-eslint/no-var-requires
				const fmt = require("../verses/formatVerse") as any;
				const formatted = fmt.applyFormatting(content.verses, formatSettings);
				const body = fmt.bodyForDisplay(formatted, formatSettings);
				const span = popup.createSpan({ cls: "content-youversion" });
				(span as HTMLElement).innerHTML = body.replace(/\n/g, "<br>");
			} catch (e) {
				// Fallback: plain text
				popup
					.createSpan({ cls: "content-youversion" })
					.setText(content.verses);
			}
			popup
				.createSpan({ cls: "info-youversion" })
				.setText(content.info.title + " " + content.info.version);
		}

		tippy(link, { content: popup, allowHTML: true });
	}

	static async processUrl(url: string, formatSettings: VerseFormat): Promise<CacheElement> {
		if (!this.cache[url]) {
			try {
				// Try to detect whether the URL targets multiple verses (range or list).
				const parsed = this.parseBibleUrl(url);

				if (parsed && parsed.versesSpec && this.isMultiVerseSpec(parsed.versesSpec)) {
					// Decide strategy based on user setting: only run the expensive hybrid
					// full-range + per-verse matching when the user wants "translation"
					const fmt = formatSettings?.text ?? "translation";
					const verseNumbers = this.expandVerses(parsed.versesSpec);

					if (fmt === "translation") {
						// Hybrid approach: fetch full range once to preserve natural line breaks,
						// then inject verse numbers at the exact verse boundaries located via per-verse content.
						const rangeCombined = await this.processSingleVerse(url);
						if (rangeCombined.err) throw 1;

						const singleUrls = verseNumbers.map((n) =>
							this.buildSingleVerseUrl(parsed.versionId, parsed.book, parsed.chapter, n)
						);
						const singles = await Promise.all(singleUrls.map((u) => this.processSingleVerse(u)));

						const baseText = rangeCombined.verses; // contains natural newlines

						// Attempt to locate each single-verse content inside baseText in order, inserting markers
						let curPos = 0;
						let result = "";
						for (let i = 0; i < verseNumbers.length; i++) {
							const markerVerse = verseNumbers[i];
							const sv = (singles[i] && !singles[i].err) ? singles[i].verses.trim() : "";
							if (!sv) continue;
							const idx = baseText.indexOf(sv, curPos);
							if (idx === -1) {
								// If not found, bail out to safe fallback: return baseText without markers.
								this.cache[url] = { err: false, info: rangeCombined.info, verses: baseText };
								return this.cache[url];
							}
							// Copy text before this verse, then insert marker, then the verse text
							result += baseText.substring(curPos, idx) + `[${markerVerse}] ` + sv;
							curPos = idx + sv.length;
						}
						// Append the remainder
						result += baseText.substring(curPos);

						if (!result || result.length < 1) throw 1;

						this.cache[url] = { err: false, info: rangeCombined.info, verses: result };
					} else {
						// manuscript or single-verse: fetch each verse and stitch them directly
						const singleUrls = verseNumbers.map((n) =>
							this.buildSingleVerseUrl(parsed.versionId, parsed.book, parsed.chapter, n)
						);
						const singles = await Promise.all(singleUrls.map((u) => this.processSingleVerse(u)));

						// If any single fetch failed, fall back to full-range fetch to be safe
						if (singles.some((s) => !s || s.err)) {
							const rangeCombined = await this.processSingleVerse(url);
							if (rangeCombined.err) throw 1;
							this.cache[url] = { err: false, info: rangeCombined.info, verses: rangeCombined.verses };
						} else {
							const texts = singles.map((s) => s.verses.trim());
							const combined = fmt === "manuscript"
								? texts.join(" ").replace(/\s+/g, " ").trim()
								: texts.join("\n");
							// Use first single's info for title/version
							this.cache[url] = { err: false, info: singles[0].info, verses: combined };
						}
					}
				} else {
					// Single verse or no spec: fallback to original single fetch behavior
					const single = await this.processSingleVerse(url);
					this.cache[url] = single;
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

	// Fetch a single verse URL and parse JSON to extract content
	private static async processSingleVerse(url: string): Promise<CacheElement> {
		if (this.cache[url]) return this.cache[url];
		try {
			const res = await requestUrl(url);
			const text = await res.text;
			const match = text.match(htmlDataRegex);
			if (!match) throw 1;
			const json_text = match[0].replace(htmlCleanupRegex, "");
			const data = JSON.parse(json_text);
			if (data.props.pageProps.type !== "verse") throw 1;

			const info = {
				title: data.props.pageProps.referenceTitle.title,
				version: data.props.pageProps.version.local_abbreviation,
			};
			const verses = (data.props.pageProps.verses as any[])
				.map((ele: any) => ele.content)
				.join(" ")
				.trim();
			if (!verses || verses.length < 1) throw 1;
			this.cache[url] = { err: false, info, verses };
			return this.cache[url];
		} catch {
			this.cache[url] = { err: true, info: { title: "", version: "" }, verses: "" };
			return this.cache[url];
		}
	}

	// Parse URLs like https://www.bible.com/bible/{versionId}/{BOOK}.{CHAPTER}[.{versesSpec}]
	private static parseBibleUrl(url: string):
		| { versionId: string; book: string; chapter: number; versesSpec?: string }
		| null {
		try {
			const u = new URL(url);
			const parts = u.pathname.split("/").filter((p) => p.length > 0);
			// Expect ["bible", versionId, bookPart]
			if (parts.length < 3 || parts[0] !== "bible") return null;
			const versionId = parts[1];
			const bookPart = parts[2];
			const segs = bookPart.split(".");
			if (segs.length < 2) return null;
			const book = segs[0];
			const chapter = parseInt(segs[1]);
			if (isNaN(chapter)) return null;
			const versesSpec = segs.length >= 3 ? segs.slice(2).join(".") : undefined;
			return { versionId, book, chapter, versesSpec };
		} catch {
			return null;
		}
	}

	private static isMultiVerseSpec(spec: string): boolean {
		// Multi-verse if contains a comma or a hyphen range or more than one numeric spec
		return spec.includes(",") || spec.includes("-");
	}

	private static expandVerses(spec: string): number[] {
		// Support comma-separated items, each either a single number or a start-end range
		const nums: number[] = [];
		const items = spec.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
		items.forEach((it) => {
			if (it.includes("-")) {
				const [a, b] = it.split("-").map((v) => parseInt(v.trim()));
				if (!isNaN(a) && !isNaN(b)) {
					const start = Math.min(a, b);
					const end = Math.max(a, b);
					for (let i = start; i <= end; i++) nums.push(i);
				}
			} else {
				const n = parseInt(it);
				if (!isNaN(n)) nums.push(n);
			}
		});
		return nums;
	}

	private static buildSingleVerseUrl(
		versionId: string,
		book: string,
		chapter: number,
		verse: number
	): string {
		return `https://www.bible.com/bible/${versionId}/${book}.${chapter}.${verse}`;
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
