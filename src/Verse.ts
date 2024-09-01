import { BibleVersion } from "./SettingsData";
import VERSIONS from "../data/versions.json";

export default abstract class Verse {
	constructor(
		private version: BibleVersion,
		private bookUrl: string,
		private book: string,
		private chapter: number,
		private verse: number | undefined,
		private verseEnd: number | undefined
	) {}

	public render(el: HTMLElement) {
		const div = el.createDiv();
		div.createSpan().setText(this.toSimpleText());
		const span = div.createSpan();
		span.addClass("verse-link-info");

		const versionAbbr = (VERSIONS as any)[this.version.language].data.find(
			(v: any) => v.id == this.version.id
		).abbreviation;
		span.setText(`${this.bookUrl} - ${versionAbbr}`);
	}

	toSimpleText() {
		return this.verse
			? this.verseEnd
				? `${this.book} ${this.chapter}:${this.verse}-${this.verseEnd}`
				: `${this.book} ${this.chapter}:${this.verse}`
			: `${this.book} ${this.chapter}`;
	}

	abstract toReplace(): Promise<string>;

	getUrl(): string {
		const base = "https://www.bible.com/bible";
		let url = `${base}/${this.version.id}/${this.bookUrl}.${this.chapter}`;
		if (this.verse) {
			url += `.${this.verse}`;
			if (this.verseEnd) url += `-${this.verseEnd}`;
		}
		return url;
	}
}
