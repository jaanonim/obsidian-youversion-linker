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

import GenerateLinks from "./GenerateLinks";
import { linkPreviewPlugin } from "./LinkPreviewEditor";
import linkPreview from "./LinkPreviewReader";

export default class ObsidianYouversionLinker extends Plugin {
	settings: ObsidianYouversionLinkerSettings;

	async onload() {
		await this.loadSettings();
		this.registerEditorSuggest(new EditorSuggester(this, this.settings));

		if (this.settings.linkPreviewRead)
			this.registerMarkdownPostProcessor(linkPreview);
		if (this.settings.linkPreviewLive)
			this.registerEditorExtension([linkPreviewPlugin]);

		this.addSettingTab(new SettingTab(this.app, this));
		this.addCommand({
			id: "generate-links",
			name: "Generate links",
			editorCallback: (editor: Editor, view: MarkdownView) =>
				GenerateLinks(editor, view, this.settings),
		});
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
