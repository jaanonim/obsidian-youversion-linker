import ObsidianYouversionLinker from '../main';
import { App, PluginSettingTab, Setting, requireApiVersion, type SettingDefinitionItem } from 'obsidian';
import { booksNames, type LanguageName } from '../books/BooksLists';
import { generateBooksList } from '../books/Books';
import { versions } from '../books/Versions';

export default class SettingTab extends PluginSettingTab {
  plugin: ObsidianYouversionLinker;

  constructor(app: App, plugin: ObsidianYouversionLinker) {
    super(app, plugin);
    this.plugin = plugin;
  }

  refresh() {
    if (requireApiVersion('1.13.0')) {
      this.update();
    } else {
      this.display();
    }
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    const sortedLanguages = Object.entries(versions).sort((a, b) => {
      if (a[1].name > b[1].name) return 1;
      if (a[1].name < b[1].name) return -1;
      return 0;
    });

    return [
      {
        type: 'list',
        heading: 'Bible versions',
        emptyState: 'No bible versions configured.',
        cls: 'bible-versions-list',
        items: this.plugin.settings.bibleVersions.map((version) => ({
          name: '',
          render: (setting: Setting) => {
            setting.addDropdown((dropdown) => {
              sortedLanguages.forEach(([lang, langData]) => {
                dropdown.addOption(lang, langData.name);
              });
              dropdown.setValue(version.language);
              dropdown.onChange(async (value) => {
                version.language = value;
                version.id = String(versions[value]?.data[0]?.id ?? value);
                await this.plugin.saveSettings();
                this.refresh();
              });
              dropdown.selectEl.addClass('version-settings-dropdown');
            });
            setting.addDropdown((dropdown) => {
              versions[version.language]?.data.forEach((entry) => {
                dropdown.addOption(`${entry.id}`, `${entry.abbreviation} - ${entry.name}`);
              });
              dropdown.setValue(version.id);
              dropdown.onChange(async (value) => {
                version.id = value;
                await this.plugin.saveSettings();
                this.refresh();
              });
              dropdown.selectEl.addClass('version-settings-dropdown');
            });
          },
        })),
        onDelete: (index: number) => {
          this.plugin.settings.bibleVersions.splice(index, 1);
          void this.plugin.saveSettings().then(() => this.refresh());
        },
        onReorder: (oldIndex: number, newIndex: number) => {
          const [removed] = this.plugin.settings.bibleVersions.splice(oldIndex, 1);
          this.plugin.settings.bibleVersions.splice(newIndex, 0, removed!);
          void this.plugin.saveSettings().then(() => this.refresh());
        },
        addItem: {
          name: 'Add bible version',
          action: () => {
            this.plugin.settings.bibleVersions.push({
              id: '1',
              language: 'eng',
            });
            void this.plugin.saveSettings().then(() => this.refresh());
          },
        },
      },
      {
        name: 'Link trigger',
        desc: 'Trigger for autocomplete for linking verse in edit mode. Supports regex.',
        control: { type: 'text', key: 'linkTrigger' },
      },
      {
        name: 'Quote trigger',
        desc: 'Trigger for autocomplete for quoting verse in edit mode. Supports regex.',
        control: { type: 'text', key: 'embedTrigger' },
      },
      {
        name: 'Footnote trigger',
        desc: "Trigger for autocomplete for inserting verse in footnote edit mode. Supports regex. NOTE: `^` is a part of insertion make sure that it's not before `[` so it want trigger in loop.",
        control: { type: 'text', key: 'footnoteTrigger' },
      },
      {
        type: 'list',
        heading: 'Languages of books names and abbreviations',
        emptyState: 'No languages configured.',
        cls: 'book-languages-list',
        items: this.plugin.settings.selectedBooksLanguages.map((lang, index) => ({
          name: 'Book language',
          render: (setting: Setting) => {
            const notSelectedLanguages = (Object.keys(booksNames) as LanguageName[])
              .sort()
              .filter(
                (ele) => !this.plugin.settings.selectedBooksLanguages.contains(ele),
              );
            setting.addDropdown((dropdown) => {
              [...notSelectedLanguages, lang].sort().forEach((name) => {
                dropdown.addOption(`${name}`, `${name}`);
              });
              dropdown.setValue(lang);
              dropdown.onChange(async (value) => {
                this.plugin.settings.selectedBooksLanguages[index] =
                  value as LanguageName;
                await this.onSelectedBooksLanguagesUpdate();
              });
              dropdown.selectEl.addClass('book-settings-dropdown');
            });
          },
        })),
        onDelete: (index: number) => {
          this.plugin.settings.selectedBooksLanguages.splice(index, 1);
          void this.onSelectedBooksLanguagesUpdate();
        },
        addItem: {
          name: 'Add language',
          action: () => {
            const notSelectedLanguages = (Object.keys(booksNames) as LanguageName[])
              .sort()
              .filter(
                (ele) => !this.plugin.settings.selectedBooksLanguages.contains(ele),
              );
            this.plugin.settings.selectedBooksLanguages.push(notSelectedLanguages[0]!);
            void this.onSelectedBooksLanguagesUpdate();
          },
        },
      },
      {
        name: 'Link preview in read view',
        desc: 'Enable or disable verse preview shown when hovered over link in read view. Disclaimer: Will take effect after restart.',
        control: { type: 'toggle', key: 'linkPreviewRead' },
      },
      {
        name: 'Link preview in edit view (experimental)',
        desc: 'Enable or disable verse preview shown when hovered over link in edit view. Disclaimer: Will take effect after restart.',
        control: { type: 'toggle', key: 'linkPreviewLive' },
      },
      {
        name: 'Callout name',
        desc: "When quoting verse, the name of the callout block. Can be set to any build in callout names (eg: 'Quote', 'info'), by default is set to custom callout 'bible'.",
        control: { type: 'text', key: 'calloutName' },
      },
    ];
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    this.bibleVersionSettings();

    new Setting(containerEl)
      .setName('Link trigger')
      .setDesc('Trigger for autocomplete for linking verse in edit mode. Supports regex.')
      .addText((text) => {
        text.setValue(this.plugin.settings.linkTrigger);
        text.onChange(async (value) => {
          this.plugin.settings.linkTrigger = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName('Quote trigger')
      .setDesc('Trigger for autocomplete for quoting verse in edit mode. Supports regex.')
      .addText((text) => {
        text.setValue(this.plugin.settings.embedTrigger);
        text.onChange(async (value) => {
          this.plugin.settings.embedTrigger = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName('Footnote trigger')
      .setDesc(
        "Trigger for autocomplete for inserting verse in footnote edit mode. Supports regex. NOTE: `^` is a part of insertion make sure that it's not before `[` so it want trigger in loop.",
      )
      .addText((text) => {
        text.setValue(this.plugin.settings.footnoteTrigger);
        text.onChange(async (value) => {
          this.plugin.settings.footnoteTrigger = value;
          await this.plugin.saveSettings();
        });
      });

    this.bookLanguageSettings();

    new Setting(containerEl)
      .setName('Link preview in read view')
      .setDesc(
        'Enable or disable verse preview shown when hovered over link in read view. Disclaimer: Will take effect after restart.',
      )
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.linkPreviewRead);
        toggle.onChange(async (value) => {
          this.plugin.settings.linkPreviewRead = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName('Link preview in edit view (experimental)')
      .setDesc(
        'Enable or disable verse preview shown when hovered over link in edit view. Disclaimer: Will take effect after restart.',
      )
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.linkPreviewLive);
        toggle.onChange(async (value) => {
          this.plugin.settings.linkPreviewLive = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName('Callout name')
      .setDesc(
        "When quoting verse, the name of the callout block. Can be set to any build in callout names (eg: 'Quote', 'info'), by default is set to custom callout 'bible'.",
      )
      .addText((text) => {
        text.setValue(this.plugin.settings.calloutName);
        text.onChange(async (value) => {
          this.plugin.settings.calloutName = value;
          await this.plugin.saveSettings();
        });
      });
  }

  bibleVersionSettings() {
    const { containerEl } = this;

    const sortedLanguages = Object.entries(versions).sort((a, b) => {
      if (a[1].name > b[1].name) return 1;
      if (a[1].name < b[1].name) return -1;
      return 0;
    });

    new Setting(containerEl)
      .setName('Bible versions')
      .setDesc('Select bible versions to which you want to link.')
      .addButton((button) => {
        button
          .setIcon('plus')
          .setTooltip('Add bible version')
          .onClick(async () => {
            this.plugin.settings.bibleVersions.push({
              id: '1',
              language: 'eng',
            });
            await this.plugin.saveSettings();
            this.refresh();
          });

        button.setDisabled(sortedLanguages.length < 1);
        if (button.disabled) {
          if (!button.buttonEl.hasClass('btn-settings-disabled'))
            button.buttonEl.addClass('btn-settings-disabled');
        } else {
          button.buttonEl.removeClass('btn-settings-disabled');
        }
      });

    this.plugin.settings.bibleVersions.forEach((version, index) => {
      const s = new Setting(containerEl)
        .setName('Bible version')
        .addDropdown((dropdown) => {
          sortedLanguages.forEach(([lang, langData]) => {
            dropdown.addOption(lang, langData.name);
          });
          dropdown.setValue(version.language);
          dropdown.onChange(async (value) => {
            version.language = value;
            version.id = String(versions[value]?.data[0]?.id ?? value);
            await this.plugin.saveSettings();
            this.refresh();
          });
          dropdown.selectEl.addClass('version-settings-dropdown');
        })
        .addDropdown((dropdown) => {
          versions[version.language]?.data.forEach((entry) => {
            dropdown.addOption(`${entry.id}`, `${entry.abbreviation} - ${entry.name}`);
          });
          dropdown.setValue(version.id);
          dropdown.onChange(async (value) => {
            version.id = value;
            await this.plugin.saveSettings();
            this.refresh();
          });
          dropdown.selectEl.addClass('version-settings-dropdown');
        })
        .addExtraButton((button) => {
          button.setIcon('up-chevron-glyph').onClick(async () => {
            if (index > 0) {
              [
                this.plugin.settings.bibleVersions[index],
                this.plugin.settings.bibleVersions[index - 1],
              ] = [
                this.plugin.settings.bibleVersions[index - 1]!,
                this.plugin.settings.bibleVersions[index]!,
              ];
              await this.plugin.saveSettings();
              this.refresh();
            }
          });
        })
        .addExtraButton((button) => {
          button.setIcon('down-chevron-glyph').onClick(async () => {
            if (index < this.plugin.settings.bibleVersions.length - 1) {
              [
                this.plugin.settings.bibleVersions[index],
                this.plugin.settings.bibleVersions[index + 1],
              ] = [
                this.plugin.settings.bibleVersions[index + 1]!,
                this.plugin.settings.bibleVersions[index]!,
              ];
              await this.plugin.saveSettings();
              this.refresh();
            }
          });
        })
        .addExtraButton((button) => {
          button
            .setIcon('cross')
            .setTooltip('Delete')
            .onClick(async () => {
              this.plugin.settings.bibleVersions.splice(index, 1);
              await this.plugin.saveSettings();
              this.refresh();
            });
        });
      s.infoEl.remove();
    });
  }

  bookLanguageSettings() {
    const { containerEl } = this;

    const notSelectedLanguages = (Object.keys(booksNames) as LanguageName[])
      .sort()
      .filter((ele) => !this.plugin.settings.selectedBooksLanguages.contains(ele));

    new Setting(containerEl)
      .setName('Languages of books names and abbreviations')
      .setDesc('Select languages of books names and abbreviations to be used in autocomplete.')
      .addButton((button) => {
        button
          .setIcon('plus')
          .setTooltip('Add language of books names')
          .onClick(async () => {
            this.plugin.settings.selectedBooksLanguages.push(notSelectedLanguages[0]!);
            await this.onSelectedBooksLanguagesUpdate();
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
            this.plugin.settings.selectedBooksLanguages[index] = value as LanguageName;
            await this.onSelectedBooksLanguagesUpdate();
          });
          dropdown.selectEl.addClass('book-settings-dropdown');
        })
        .addExtraButton((button) => {
          button
            .setIcon('cross')
            .setTooltip('Delete')
            .onClick(async () => {
              this.plugin.settings.selectedBooksLanguages.splice(index, 1);
              await this.onSelectedBooksLanguagesUpdate();
            });
        });
      s.infoEl.remove();
    });
  }

  async onSelectedBooksLanguagesUpdate() {
    await this.plugin.saveSettings();
    generateBooksList(this.plugin.settings);
    this.refresh();
  }
}
