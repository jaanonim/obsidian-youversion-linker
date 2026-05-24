import { escapeMarkdown } from "src/utils/Markdown";
import LinkPreviewManager from "../preview/LinkPreview";
import { BibleVersion } from "../settings/SettingsData";
import Verse, { VerseElement } from "./Verse";
import { QuoteSettings } from "src/settings/SettingsData";

export default class VerseEmbed extends Verse {
	constructor(
		version: BibleVersion,
		bookUrl: string,
		book: string,
		chapter: number,
		verses: Array<VerseElement>,
		private insertNewLine: boolean,
		private calloutName: string,
		private quoteSettings: QuoteSettings
	) {
		super(version, bookUrl, book, chapter, verses);
	}

	async toReplace(): Promise<string> {
		const content = await LinkPreviewManager.processUrl(this.getUrl());
		const p = this.insertNewLine ? "\n" : "";
		if (content.err) {
			return `${p}>[!Error] Cannot get content of ${this.toSimpleText()}.\n`;
		} else {
			let calloutIcon = this.quoteSettings.showBibleIcon 
				? `[!${this.calloutName}]`
				: this.calloutName;
			
			if (this.quoteSettings.showBibleIcon && this.quoteSettings.collapsibleVerses) {
				if (this.quoteSettings.collapsedByDefault) {
					calloutIcon += '-';
				} else {
					calloutIcon += '+';
				}
			}

			const versionText = this.quoteSettings.showTranslation 
				? ` ${content.info.version}` 
				: '';
			
			// prettier-ignore
			return `${p}>${calloutIcon} [${this.toSimpleText()}${versionText}](${this.getUrl()})\n>${escapeMarkdown(content.verses).replace(/\n/g,'\n>')}\n`;
		}
	}
}
