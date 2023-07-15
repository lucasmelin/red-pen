import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import { EditorState, StateField } from "@codemirror/state";
import { unified } from "unified";
import retextIntensify from "retext-intensify";
import retextReadability from "retext-readability";
import retextPassive from "retext-passive";
import retextSimplify from "retext-simplify";
import retextSyntaxMentions from "retext-syntax-mentions";
import retextSyntaxUrls from "retext-syntax-urls";
import retextEnglish from "retext-english";
import retextStringify from "retext-stringify";

interface ObsidianRetextSettings {
  defaultVisibility: "show" | "hide";
  readingAge: number;
  checkIntensify: boolean;
  checkReadability: boolean;
  checkPassive: boolean;
  checkSimplify: boolean;
}

const DEFAULT_SETTINGS: ObsidianRetextSettings = {
  defaultVisibility: "show",
  readingAge: 12,
  checkIntensify: true,
  checkReadability: true,
  checkPassive: true,
  checkSimplify: true,
};

export default class ObsidianRetextPlugin extends Plugin {
  settings: ObsidianRetextSettings;

  async onload() {
    await this.loadSettings();
    console.log("Loaded Obsidian Retext");
    this.registerEditorExtension([highlight_field(this.settings)]);
    this.addSettingTab(new ObsidianRetextSettingsTab(this.app, this));
    if (this.settings.defaultVisibility === "show") {
      document.body.addClass("show-retext");
    }
    this.addCommand({
      id: "toggle-retext-highlights",
      name: "Toggle Retext Highlights",
      callback: () => {
        document.body.hasClass("show-retext")
          ? document.body.removeClass("show-retext")
          : document.body.addClass("show-retext");
      },
    });
  }

  onunload() {
    console.log("Unloaded Obsidian Retext");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

function highlight_field(settings: ObsidianRetextSettings) {
  return StateField.define<DecorationSet>({
    create(state: EditorState) {
      return Decoration.none;
    },
    update(highlights, transaction) {
      const new_highlights = highlights.map(transaction.changes);
      const updated_doc = transaction.newDoc.sliceString(0);

      const processor = unified()
        // These provide parsers
        .use(retextEnglish)
        .use(retextReadability, { age: settings.readingAge })
        .use(retextIntensify)
        .use(retextPassive)
        .use(retextSimplify)
        .use(retextSyntaxMentions)
        .use(retextSyntaxUrls)
        // This provides the compiler
        .use(retextStringify);

      const file = processor.processSync(updated_doc);

      const decoration = [];

      for (const msg of file.messages) {
        const start = msg.position?.start.offset || 0;
        const end = msg.position?.end.offset;
        decoration.push(
          Decoration.mark({
            class: pluginClass(msg.source),
          }).range(start, end)
        );
      }
      return new_highlights.update({
        add: decoration,
        sort: true,
      });
    },
    provide: (field) => EditorView.decorations.from(field),
  });
}

function pluginClass(name: string | null): string {
  switch (name) {
    case "retext-intensify":
      return "retext-mark-intensify";
    case "retext-passive":
      return "retext-mark-passive";
    case "retext-readability":
      return "retext-mark-readability";
    case "retext-simplify":
      return "retext-mark-simplify";
    default:
      return "";
  }
}

class ObsidianRetextSettingsTab extends PluginSettingTab {
  plugin: ObsidianRetextPlugin;
  constructor(app: App, plugin: ObsidianRetextPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new Setting(containerEl)
      .setName("Show Highlights")
      .setDesc("Show retext highlights")
      .addDropdown((c) => {
        c.addOption("show", "Show");
        c.addOption("hide", "Hide");
        c.setValue(this.plugin.settings.defaultVisibility).onChange(
          async (value: "show" | "hide") => {
            this.plugin.settings.defaultVisibility = value;
            await this.plugin.saveSettings();
          }
        );
      });
    new Setting(containerEl)
      .setName("Check Intensify")
      .setDesc("Highlight weak or passive writing")
      .addToggle((c) => {
        c.setValue(this.plugin.settings.checkIntensify).onChange(
          async (value) => {
            this.plugin.settings.checkIntensify = value;
            await this.plugin.saveSettings();
          }
        );
      });
    new Setting(containerEl)
      .setName("Check Passive")
      .setDesc("Highlight use of passive voice")
      .addToggle((c) => {
        c.setValue(this.plugin.settings.checkPassive).onChange(
          async (value) => {
            this.plugin.settings.checkPassive = value;
            await this.plugin.saveSettings();
          }
        );
      });
    new Setting(containerEl)
      .setName("Check Simplify")
      .setDesc("Highlight words that could be simplified")
      .addToggle((c) => {
        c.setValue(this.plugin.settings.checkSimplify).onChange(
          async (value) => {
            this.plugin.settings.checkSimplify = value;
            await this.plugin.saveSettings();
          }
        );
      });
  }
}
