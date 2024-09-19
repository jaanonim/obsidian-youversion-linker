import { BibleVersion } from "./SettingsData";
import VERSIONS from "../data/versions.json";

export class VerseElement {
	public start: number;
	public end: number | undefined;

	public constructor(start: number, end: number | undefined) {
		this.start = start;
		this.end = end;
	}

	public toString() {
		return `${this.start}${this.end ? `-${this.end}` : ""}`;
	}
}

export default abstract class Verse {
	constructor(
		private version: BibleVersion,
		private bookUrl: string,
		private book: string,
		private chapter: number,
		private verses: Array<VerseElement>
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
		return this.verses.length > 0
			? `${this.book} ${this.chapter}:${this.verses
					.map((verse) => verse.toString())
					.join(", ")}`
			: `${this.book} ${this.chapter}`;
	}

	abstract toReplace(): Promise<string>;

	getUrl(): string {
		const base = "https://www.bible.com/bible";
		let url = `${base}/${this.version.id}/${this.bookUrl}.${this.chapter}`;
		if (this.verses.length > 0) {
			url += `.${this.verses.map((verse) => verse.toString()).join(",")}`;
		}
		return url;
	}
}
