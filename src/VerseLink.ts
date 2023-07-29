export default class VerseLink {
	constructor(
		private bookUrl: string,
		private book: string,
		private chapter: number,
		private verse: number,
		private verseEnd: number | undefined
	) {}

	public render(el: HTMLElement) {
		el.createDiv().setText(this.toSimpleText());
	}

	toSimpleText() {
		return this.verseEnd
			? `${this.book} ${this.chapter}:${this.verse}-${this.verseEnd}`
			: `${this.book} ${this.chapter}:${this.verse}`;
	}

	toLink(): string {
		return `[${this.toSimpleText()}](${this.getUrl()})`;
	}

	getUrl(): string {
		const base = "https://www.bible.com/bible";
		const version = 1;
		let url = `${base}/${version}/${this.bookUrl}.${this.chapter}.${this.verse}`;
		if (this.verseEnd) url += `-${this.verseEnd}`;
		return url;
	}
}
