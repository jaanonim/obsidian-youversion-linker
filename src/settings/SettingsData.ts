import type { LanguageName } from '../books/BooksLists';

const CONFIG_VERSION = 1;

export interface BibleVersion {
  id: string;
  language: string;
}

export interface ObsidianYouversionLinkerSettings {
  version: number;

  bibleVersions: BibleVersion[];
  linkPreviewRead: boolean;
  linkPreviewLive: boolean;
  linkTrigger: string;
  embedTrigger: string;
  footnoteTrigger: string;
  selectedBooksLanguages: LanguageName[];
  calloutName: string;
	quoteShowTranslation: boolean;
	quoteShowBibleIcon: boolean;
	quoteCollapsibleVerses: boolean;
	quoteCollapsedByDefault: boolean;
}

export const DEFAULT_SETTINGS: ObsidianYouversionLinkerSettings = {
  version: CONFIG_VERSION,

  bibleVersions: [
    {
      id: '1',
      language: 'eng',
    },
  ],
  linkPreviewRead: true,
  linkPreviewLive: true,
  linkTrigger: '@',
  embedTrigger: '>',
  footnoteTrigger: '\\^',
  selectedBooksLanguages: ['English'],
  calloutName: 'Bible',
	quoteShowTranslation: true,
	quoteShowBibleIcon: true,
	quoteCollapsibleVerses: false,
	quoteCollapsedByDefault: false,
};
