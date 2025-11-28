import { escapeMarkdown } from "src/utils/Markdown";
import LinkPreviewManager from "../preview/LinkPreview";
import { BibleVersion } from "../settings/SettingsData";
import Verse, { VerseElement } from "./Verse";

export default class VerseEmbed extends Verse {
	constructor(
		version: BibleVersion,
		bookUrl: string,
		book: string,
		chapter: number,
		verses: Array<VerseElement>,
		private insertNewLine: boolean,
		private calloutName: string,
		private showTranslation: boolean,
		private showBibleIcon: boolean,
		private collapsibleVerses: boolean,
		private collapsedByDefault: boolean
	) {
		super(version, bookUrl, book, chapter, verses);
	}

	async toReplace(): Promise<string> {
		const content = await LinkPreviewManager.processUrl(this.getUrl());
		const p = this.insertNewLine ? "\n" : "";
		if (content.err) {
			return `${p}>[!Error] Cannot get content of ${this.toSimpleText()}.\n`;
		} else {
			// Determine callout icon
			let calloutIcon = this.showBibleIcon 
				? `[!${this.calloutName}]`
				: this.calloutName;
			
			// Add collapsible markers if enabled
			if (this.showBibleIcon && this.collapsibleVerses) {
				if (this.collapsedByDefault) {
					calloutIcon += '-';
				} else {
					calloutIcon += '+';
				}
			}

			// Determine version display
			const versionText = this.showTranslation 
				? ` ${content.info.version}` 
				: '';
			
			// prettier-ignore
			return `${p}>${calloutIcon} [${this.toSimpleText()}${versionText}](${this.getUrl()})\n>${escapeMarkdown(content.verses).replace(/\n/g,'\n>')}\n`;
		}
	}
}
