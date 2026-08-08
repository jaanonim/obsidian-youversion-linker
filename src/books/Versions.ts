import _versions from '../../data/versions.json';

export type VersionEntry = {
  name: string;
  abbreviation: string;
  id: number;
};

export type LanguageData = {
  name: string;
  data: VersionEntry[];
};

export type VersionsData = {
  [key: string]: LanguageData;
};

export const versions = _versions as VersionsData;
