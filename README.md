![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/jaanonim/obsidian-youversion-linker?style=for-the-badge&sort=semver) ![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22youversion-linker%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json&style=for-the-badge)

# Obsidian YouVersion Linker Plugin

**Automatically link bible verses in your notes to [YouVersion bible](https://www.bible.com/).**

**List of supported languages can be found [here](./Languages.md).**

You can for example type:

-   `@ John 1:1-6` to link verse
-   `> John 1:1-6` to quote verse
-   `^ John 1:1-6` to quote in footnote

It also supports multiple verses like: `John 3:16,18-20`.

`@`, `>` and `^` chars are triggers for suggestion and they can be changed in settings.
In settings you can select which version of bible you want to use and books names in which language will be detected.

I'm from Poland so plugin supports polish books names (eq. `J 1:1-6`, `Mt 24,1`). If you would like it to support your language books names read the guide in [Languages.md](./Languages.md).

The plugins is heavily inspired by [obsidian-bible-reference](https://github.com/tim-hub/obsidian-bible-reference) (also i have "borrowed" some code from there) so check it out.

It's available in Obsidian community plugins as
[YouVersion Linker](https://obsidian.md/plugins?id=youversion-linker).
