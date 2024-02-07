import ObsidianYouversionLinker from "./main";
import { App, Notice, PluginSettingTab, Setting } from "obsidian";
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

		new Setting(containerEl)
			.setName("Bible language")
			.setDesc(
				"Select language of bible from youVersion to witch will be lined."
			)
			.addDropdown((dropdown) => {
				Object.keys(VERSIONS)
					.sort((a, b) => {
						if (
							(VERSIONS as any)[a].name >
							(VERSIONS as any)[b].name
						)
							return 1;
						if (
							(VERSIONS as any)[a].name <
							(VERSIONS as any)[b].name
						)
							return -1;
						return 0;
					})

					.forEach((lang) => {
						dropdown.addOption(lang, (VERSIONS as any)[lang].name);
					});
				dropdown.setValue(this.plugin.settings.bibleLanguage);
				dropdown.onChange(async (value) => {
					this.plugin.settings.bibleLanguage = value;
					this.plugin.settings.bibleVersion = (VERSIONS as any)[
						value
					].data[0].id;
					await this.plugin.saveSettings();
					new Notice("Bible language settings updated");
					this.display();
				});
			});

		new Setting(containerEl)
			.setName("Bible version")
			.setDesc(
				"Select version of bible from youVersion to witch will be lined."
			)
			.addDropdown((dropdown) => {
				(VERSIONS as any)[
					this.plugin.settings.bibleLanguage
				].data.forEach((version: any) => {
					dropdown.addOption(
						`${version.id}`,
						`${version.abbreviation} - ${version.name}`
					);
				});

				dropdown.setValue(this.plugin.settings.bibleVersion);
				dropdown.onChange(async (value) => {
					this.plugin.settings.bibleVersion = value;
					await this.plugin.saveSettings();
					new Notice("Bible version settings updated");
				});
			});

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

				button.setDisabled(notSelectedLanguages.length < 1);
				if (button.disabled) {
					if (!button.buttonEl.hasClass("btn-settings-disabled"))
						button.buttonEl.addClass("btn-settings-disabled");
				} else {
					button.buttonEl.removeClass("btn-settings-disabled");
				}
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

	async onSelectedBooksLanguagesUpdate() {
		await this.plugin.saveSettings();
		generateBooksList(this.plugin.settings);
		this.display();
	}
}
