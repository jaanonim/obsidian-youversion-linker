import LinkPreviewManager from "../preview/LinkPreview";
import Verse from "./Verse";

export default class VerseFootnote extends Verse {
	async toReplace(): Promise<string> {
		const content = await LinkPreviewManager.processUrl(this.getUrl());
		const linkText = this.toSimpleText();
		return `[^${linkText.replace(/\s/g, "")}${content.info.version}]`;
	}

	async endInsert(): Promise<string> {
		const content = await LinkPreviewManager.processUrl(this.getUrl());
		const linkText = this.toSimpleText();
		if (content.err) {
			// prettier-ignore
			return `\n[^${linkText.replace(/\s/g,"")}${content.info.version}]: [${linkText} ${content.info.version}](${this.getUrl()})`;
		} else {
			// prettier-ignore
			return `\n[^${linkText.replace(/\s/g,"")}${content.info.version}]: [${linkText} ${content.info.version}](${this.getUrl()}) ${content.verses.replace(/\n/g,' ')}`;
		}
	}
}
