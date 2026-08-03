import { escapeMarkdown } from "src/utils/Markdown";
import LinkPreviewManager from "../preview/LinkPreview";
import Verse, { VerseElement } from "./Verse";
import { applyFormatting, bodyForDisplay } from "./formatVerse";
import type { BibleVersion, VerseFormat } from "src/settings/SettingsData";

export default class VerseFootnote extends Verse {
	constructor(
		version: BibleVersion,
		bookUrl: string,
		book: string,
		chapter: number,
		verses: Array<VerseElement>,
		private verseFormat: VerseFormat
	) {
		super(version, bookUrl, book, chapter, verses);
	}

	async toReplace(): Promise<string> {
		const content = await LinkPreviewManager.processUrl(this.getUrl(), this.verseFormat);
		const linkText = this.toSimpleText();
		return `[^${linkText.replace(/\s/g, "")}${content.info.version}]`;
	}

	async endInsert(): Promise<string> {
		const content = await LinkPreviewManager.processUrl(this.getUrl(), this.verseFormat);
		const linkText = this.toSimpleText();
		if (content.err) {
			// prettier-ignore
			return `\n[^${linkText.replace(/\s/g,"")}${content.info.version}]: [${linkText} ${content.info.version}](${this.getUrl()})`;
		} else {
			const formatted = applyFormatting(content.verses, this.verseFormat);
			const body = bodyForDisplay(formatted, this.verseFormat);
			const oneLine = body.replace(/\n/g, " ");
			// prettier-ignore
			return `\n[^${linkText.replace(/\s/g,"")}${content.info.version}]: [${linkText} ${content.info.version}](${this.getUrl()}) ${oneLine}`;
		}
	}
}
