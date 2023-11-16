export default class VerseLink {
	constructor(
		private version: string,
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
		span.setText(this.bookUrl);
	}

	toSimpleText() {
		return this.verse
			? this.verseEnd
				? `${this.book} ${this.chapter}:${this.verse}-${this.verseEnd}`
				: `${this.book} ${this.chapter}:${this.verse}`
			: `${this.book} ${this.chapter}`;
	}

	toLink(): string {
		return `[${this.toSimpleText()}](${this.getUrl()})`;
	}

	getUrl(): string {
		const base = "https://www.bible.com/bible";
		let url = `${base}/${this.version}/${this.bookUrl}.${this.chapter}`;
		if (this.verse) {
			url += `.${this.verse}`;
			if (this.verseEnd) url += `-${this.verseEnd}`;
		}
		return url;
	}
}
