import { EditorSuggester } from "./EditorSuggester";
import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import SettingTab from "./SettingTab";
import {
	DEFAULT_SETTINGS,
	ObsidianYouversionLinkerSettings,
} from "./SettingsData";
import linkPreview from "./LinkPreview";

// Remember to rename these classes and interfaces!

export default class ObsidianYouversionLinker extends Plugin {
	settings: ObsidianYouversionLinkerSettings;

	async onload() {
		await this.loadSettings();
		this.registerMarkdownPostProcessor(linkPreview);
		this.registerEditorSuggest(new EditorSuggester(this, this.settings));
		this.addSettingTab(new SettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
