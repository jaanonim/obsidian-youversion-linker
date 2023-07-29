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

// Remember to rename these classes and interfaces!

interface ObsidianYouversionLinkerSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: ObsidianYouversionLinkerSettings = {
	mySetting: "default",
};

export default class ObsidianYouversionLinker extends Plugin {
	settings: ObsidianYouversionLinkerSettings;

	async onload() {
		await this.loadSettings();

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
