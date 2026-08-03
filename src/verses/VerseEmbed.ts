import { escapeMarkdown } from "src/utils/Markdown";
import LinkPreviewManager from "../preview/LinkPreview";
import { BibleVersion } from "../settings/SettingsData";
import Verse, { VerseElement } from "./Verse";
import { applyFormatting, bodyForDisplay } from "./formatVerse";
import type { VerseFormat } from "src/settings/SettingsData";

export default class VerseEmbed extends Verse {
	constructor(
		version: BibleVersion,
		bookUrl: string,
		book: string,
		chapter: number,
		verses: Array<VerseElement>,
		private insertNewLine: boolean,
		private calloutName: string,
		private verseFormat: VerseFormat
	) {
		super(version, bookUrl, book, chapter, verses);
	}

	async toReplace(): Promise<string> {
		const content = await LinkPreviewManager.processUrl(this.getUrl(), this.verseFormat);
		const p = this.insertNewLine ? "\n" : "";
		if (content.err) {
			return `${p}>[!Error] Cannot get content of ${this.toSimpleText()}.\n`;
		} else {
			const formatted = applyFormatting(content.verses, this.verseFormat);
			const body = bodyForDisplay(formatted, this.verseFormat);
			// prettier-ignore
			return `${p}>[!${this.calloutName}] [${this.toSimpleText()} ${content.info.version}](${this.getUrl()})\n>${body.replace(/\n/g,'\n>')}\n`;
		}
	}
}
