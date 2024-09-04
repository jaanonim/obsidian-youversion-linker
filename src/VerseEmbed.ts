import LinkPreviewManager from "./LinkPreview";
import Verse from "./Verse";

export default class VerseEmbed extends Verse {
	async toReplace(): Promise<string> {
		const content = await LinkPreviewManager.processUrl(this.getUrl());
		if (content.err) {
			return `>[!Error] Cannot get content of ${this.toSimpleText()}.\n`;
		} else {
			// prettier-ignore
			return `>[!Quote] [${this.toSimpleText()} ${content.info.version}](${this.getUrl()})\n>${content.verses.replace(/\n/g,'\n>')}\n`;
		}
	}
}
