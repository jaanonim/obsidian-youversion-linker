import LinkPreviewManager from "./LinkPreview";
import { BibleVersion } from "./SettingsData";
import Verse, { VerseElement } from "./Verse";

export default class VerseEmbed extends Verse {
	constructor(
		version: BibleVersion,
		bookUrl: string,
		book: string,
		chapter: number,
		verses: Array<VerseElement>,
		private insertNewLine: boolean
	) {
		super(version, bookUrl, book, chapter, verses);
	}

	async toReplace(): Promise<string> {
		const content = await LinkPreviewManager.processUrl(this.getUrl());
		const p = this.insertNewLine ? "\n" : "";
		if (content.err) {
			return `${p}>[!Error] Cannot get content of ${this.toSimpleText()}.\n`;
		} else {
			// prettier-ignore
			return `${p}>[!Quote] [${this.toSimpleText()} ${content.info.version}](${this.getUrl()})\n>${content.verses.replace(/\n/g,'\n>')}\n`;
		}
	}
}
