import Verse from "./Verse";

export default class VerseLink extends Verse {
	async toReplace(): Promise<string> {
		return `[${this.toSimpleText()}](${this.getUrl()})`;
	}
}
