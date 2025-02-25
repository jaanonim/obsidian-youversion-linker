export interface BibleVersion {
	id: string;
	language: string;
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
};
