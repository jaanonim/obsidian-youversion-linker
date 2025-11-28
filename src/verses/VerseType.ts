import {
	BibleVersion,
	ObsidianYouversionLinkerSettings,
} from "src/settings/SettingsData";
import { VerseElement } from "./Verse";
import VerseEmbed from "./VerseEmbed";
import VerseLink from "./VerseLink";
import VerseFootnote from "./VerseFootnote";

export enum VerseType {
	EMBED = ">",
	EMBED_NL = "<",
	LINK = "@",
	FOOTNOTE = "^",
}

export function makeRegexTypeList(settings: ObsidianYouversionLinkerSettings) {
	return [
		{
			regex: new RegExp(settings.linkTrigger, "u"),
			t: VerseType.LINK,
		},
		{
			regex: new RegExp(settings.embedTrigger, "u"),
			t: VerseType.EMBED,
			tn: VerseType.EMBED_NL,
		},
		{
			regex: new RegExp(settings.footnoteTrigger, "u"),
			t: VerseType.FOOTNOTE,
		},
	];
}

export interface VerseMakeInterface {
	version: BibleVersion;
	bookUrl: string;
	book: string;
	chapter: number;
	verses: Array<VerseElement>;
}

export function makeVerseByType(
	verseType: VerseType,
	data: VerseMakeInterface,
	settings: ObsidianYouversionLinkerSettings
) {
	switch (verseType) {
		case VerseType.EMBED:
			return new VerseEmbed(
				data.version,
				data.bookUrl,
				data.book,
				data.chapter,
				data.verses,
				false,
				settings.calloutName,
				settings.quoteShowTranslation,
				settings.quoteShowBibleIcon,
				settings.quoteCollapsibleVerses,
				settings.quoteCollapsedByDefault
			);
		case VerseType.EMBED_NL:
			return new VerseEmbed(
				data.version,
				data.bookUrl,
				data.book,
				data.chapter,
				data.verses,
				true,
				settings.calloutName,
				settings.quoteShowTranslation,
				settings.quoteShowBibleIcon,
				settings.quoteCollapsibleVerses,
				settings.quoteCollapsedByDefault
			);
		case VerseType.LINK:
			return new VerseLink(
				data.version,
				data.bookUrl,
				data.book,
				data.chapter,
				data.verses
			);
		case VerseType.FOOTNOTE:
			return new VerseFootnote(
				data.version,
				data.bookUrl,
				data.book,
				data.chapter,
				data.verses
			);
	}
}
