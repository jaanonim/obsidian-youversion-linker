import ObsidianYouversionLinker from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";
import VERSIONS from "../data/versions.json";
import booksNames from "./BooksLists";
import { generateBooksList } from "./Books";

export default class SettingTab extends PluginSettingTab {
	plugin: ObsidianYouversionLinker;

	constructor(app: App, plugin: ObsidianYouversionLinker) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		this.bibleVersionSettings();

		new Setting(containerEl)
			.setName("Trigger")
			.setDesc("Trigger for autocomplete in edit mode. Supports regex.")
			.addText((text) => {
				text.setValue(this.plugin.settings.trigger);
				text.onChange(async (value) => {
					this.plugin.settings.trigger = value;
					await this.plugin.saveSettings();
				});
			});

		this.bookLanguageSettings();

		new Setting(containerEl)
			.setName("Link Preview in read view")
			.setDesc(
				"Enable or disable verse preview shown when hovered over link in read view. DISCLAIMER: Will take effect after restart."
			)
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.linkPreviewRead);
				toggle.onChange(async (value) => {
					this.plugin.settings.linkPreviewRead = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Link Preview in edit view (experimental)")
			.setDesc(
				"Enable or disable verse preview shown when hovered over link in edit view. DISCLAIMER: Will take effect after restart."
			)
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.linkPreviewLive);
				toggle.onChange(async (value) => {
					this.plugin.settings.linkPreviewLive = value;
					await this.plugin.saveSettings();
				});
			});
	}

	bibleVersionSettings() {
		const { containerEl } = this;

		const sortedLanguages = Object.keys(VERSIONS).sort((a, b) => {
			if ((VERSIONS as any)[a].name > (VERSIONS as any)[b].name) return 1;
			if ((VERSIONS as any)[a].name < (VERSIONS as any)[b].name)
				return -1;
			return 0;
		});

		new Setting(containerEl)
			.setName("Bible versions")
			.setDesc("Select bible versions to which you want to link.")
			.addButton((button) => {
				button
					.setIcon("plus")
					.setTooltip("Add bible version")
					.onClick(async () => {
						this.plugin.settings.bibleVersions.push({
							id: "1",
							language: "eng",
						});
						await this.plugin.saveSettings();
						this.display();
					});

				button.setDisabled(sortedLanguages.length < 1);
				if (button.disabled) {
					if (!button.buttonEl.hasClass("btn-settings-disabled"))
						button.buttonEl.addClass("btn-settings-disabled");
				} else {
					button.buttonEl.removeClass("btn-settings-disabled");
				}
			});

		this.plugin.settings.bibleVersions.forEach((version, index) => {
			const s = new Setting(containerEl)
				.setName("Bible version")
				.addDropdown((dropdown) => {
					sortedLanguages.forEach((lang) => {
						dropdown.addOption(lang, (VERSIONS as any)[lang].name);
					});
					dropdown.setValue(version.language);
					dropdown.onChange(async (value) => {
						this.plugin.settings.bibleVersions[index].language =
							value;
						this.plugin.settings.bibleVersions[index].id = (
							VERSIONS as any
						)[value].data[0].id;
						await this.plugin.saveSettings();
						this.display();
					});
					dropdown.selectEl.addClass("version-settings-dropdown");
				})
				.addDropdown((dropdown) => {
					(VERSIONS as any)[version.language].data.forEach(
						(version: any) => {
							dropdown.addOption(
								`${version.id}`,
								`${version.abbreviation} - ${version.name}`
							);
						}
					);
					dropdown.setValue(version.id);
					dropdown.onChange(async (value) => {
						this.plugin.settings.bibleVersions[index].id = value;
						await this.plugin.saveSettings();
						this.display();
					});
					dropdown.selectEl.addClass("version-settings-dropdown");
				})
				.addExtraButton((button) => {
					button.setIcon("up-chevron-glyph").onClick(async () => {
						if (index > 0) {
							[
								this.plugin.settings.bibleVersions[index],
								this.plugin.settings.bibleVersions[index - 1],
							] = [
								this.plugin.settings.bibleVersions[index - 1],
								this.plugin.settings.bibleVersions[index],
							];
							await this.plugin.saveSettings();
							this.display();
						}
					});
				})
				.addExtraButton((button) => {
					button.setIcon("down-chevron-glyph").onClick(async () => {
						if (
							index <
							this.plugin.settings.bibleVersions.length - 1
						) {
							[
								this.plugin.settings.bibleVersions[index],
								this.plugin.settings.bibleVersions[index + 1],
							] = [
								this.plugin.settings.bibleVersions[index + 1],
								this.plugin.settings.bibleVersions[index],
							];
							await this.plugin.saveSettings();
							this.display();
						}
					});
				})
				.addExtraButton((button) => {
					button
						.setIcon("cross")
						.setTooltip("Delete")
						.onClick(async () => {
							this.plugin.settings.bibleVersions.splice(index, 1);
							await this.plugin.saveSettings();
							this.display();
						});
				});
			s.infoEl.remove();
		});
	}

	bookLanguageSettings() {
		const { containerEl } = this;

		const notSelectedLanguages = Object.keys(booksNames)
			.sort()
			.filter(
				(ele) =>
					!this.plugin.settings.selectedBooksLanguages.contains(ele)
			);

		new Setting(containerEl)
			.setName("Languages of books names and abbreviations")
			.setDesc(
				"Select languages of books names and abbreviations to be used in autocomplete."
			)
			.addButton((button) => {
				button
					.setIcon("plus")
					.setTooltip("Add language of books names")
					.onClick(async () => {
						this.plugin.settings.selectedBooksLanguages.push(
							notSelectedLanguages[0]
						);
						this.onSelectedBooksLanguagesUpdate();
					});
			});

		this.plugin.settings.selectedBooksLanguages.forEach((lang, index) => {
			const s = new Setting(containerEl)
				.addDropdown((dropdown) => {
					[...notSelectedLanguages, lang].sort().forEach((name) => {
						dropdown.addOption(`${name}`, `${name}`);
					});
					dropdown.setValue(lang);
					dropdown.onChange(async (value) => {
						this.plugin.settings.selectedBooksLanguages[index] =
							value;
						this.onSelectedBooksLanguagesUpdate();
					});
					dropdown.selectEl.addClass("book-settings-dropdown");
				})
				.addExtraButton((button) => {
					button
						.setIcon("cross")
						.setTooltip("Delete")
						.onClick(async () => {
							this.plugin.settings.selectedBooksLanguages.splice(
								index,
								1
							);
							this.onSelectedBooksLanguagesUpdate();
						});
				});
			s.infoEl.remove();
		});
	}

	async onSelectedBooksLanguagesUpdate() {
		await this.plugin.saveSettings();
		generateBooksList(this.plugin.settings);
		this.display();
	}
}
