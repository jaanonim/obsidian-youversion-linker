export interface BibleVersion {
	id: string;
	language: string;
}

export interface VerseFormat {
	text: "translation" | "manuscript" | "single-verse";
	number:
		| "none"
		| "plain"    // 1
		| "dot"      // 1.
		| "paren"    // 1)
		| "dash"     // 1 -
		| "bold"             // **1**
		| "italic"           // *1*
		| "superscript"      // <sup>1</sup>
		| "superscript-bold" // <sup><b>1</b></sup>
		| "superscript-italic"; // <sup><i>1</i></sup>
}

export interface ObsidianYouversionLinkerSettings {
	bibleVersions: BibleVersion[];
	linkPreviewRead: boolean;
	linkPreviewLive: boolean;
	linkTrigger: string;
	embedTrigger: string;
	footnoteTrigger: string;
	selectedBooksLanguages: string[];
	calloutName: string;
	verseFormat: VerseFormat;
}

export const DEFAULT_SETTINGS: ObsidianYouversionLinkerSettings = {
	bibleVersions: [
		{
			id: "1",
			language: "eng",
		},
	],
	linkPreviewRead: true,
	linkPreviewLive: true,
	linkTrigger: "@",
	embedTrigger: ">",
	footnoteTrigger: "(?<!\\[)\\^",
	selectedBooksLanguages: ["English"],
	calloutName: "Bible",
	verseFormat: {
		text: "translation",
		number: "superscript",
	}
};
