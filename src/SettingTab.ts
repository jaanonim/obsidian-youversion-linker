import ObsidianYouversionLinker from "./main";
import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import VERSIONS from "../data/versions.json";

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
}
