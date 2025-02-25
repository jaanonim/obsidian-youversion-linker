import LinkPreviewManager from "./LinkPreview";
import Verse from "./Verse";

export default class VerseFootnote extends Verse {
	async toReplace(): Promise<string> {
		const content = await LinkPreviewManager.processUrl(this.getUrl());
		const linkText = this.toSimpleText();
		return `[^${linkText.replace(/\s/, "")}${content.info.version}]`;
	}

	async endInsert(): Promise<string> {
		const content = await LinkPreviewManager.processUrl(this.getUrl());
		const linkText = this.toSimpleText();
		if (content.err) {
			return `>[!Error] Cannot get content of ${linkText}.\n`;
		} else {
			// prettier-ignore
			return `[^${linkText.replace(/\s/,"")}${content.info.version}]: [${linkText} ${content.info.version}](${this.getUrl()}) ${content.verses.replace(/\n/g,' ')}\n`;
		}
	}
}
