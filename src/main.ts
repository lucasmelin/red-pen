import {
  App,
  ItemView,
  Plugin,
  PluginSettingTab,
  Setting,
  WorkspaceLeaf,
} from "obsidian";
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
    this.registerView(
      "retext-summary",
      (leaf) => new RetextSummaryView(leaf, this.settings)
    );
    if (this.settings.defaultVisibility === "show") {
      document.body.addClass("show-retext");
      this.activateView();
    }
    this.addCommand({
      id: "toggle-retext-highlights",
      name: "Toggle Retext Highlights",
      callback: () => {
        if (document.body.hasClass("show-retext")) {
          document.body.removeClass("show-retext");
          this.deactivateView();
        } else {
          document.body.addClass("show-retext");
          this.activateView();
        }
      },
    });
  }

  onunload() {
    console.log("Unloaded Obsidian Retext");
    this.app.workspace.detachLeavesOfType("retext-summary");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async activateView() {
    this.app.workspace.detachLeavesOfType("retext-summary");

    await this.app.workspace.getRightLeaf(false).setViewState({
      type: "retext-summary",
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType("retext-summary")[0]
    );
  }

  async deactivateView() {
    this.app.workspace.detachLeavesOfType("retext-summary");
  }
}

function highlight_field(settings: ObsidianRetextSettings) {
  return StateField.define<DecorationSet>({
    create(state: EditorState) {
      return Decoration.none;
    },
    update(highlights, transaction) {
      let processor = unified()
        .use(retextEnglish)
        .use(retextSyntaxMentions)
        .use(retextSyntaxUrls);

      if (settings.checkReadability) {
        processor = processor.use(retextReadability, {
          age: settings.readingAge,
        });
      }

      if (settings.checkIntensify) {
        processor = processor.use(retextIntensify);
      }

      if (settings.checkPassive) {
        processor = processor.use(retextPassive);
      }

      if (settings.checkSimplify) {
        processor = processor.use(retextSimplify);
      }

      // This provides the compiler
      processor = processor.use(retextStringify);

      let new_highlights = highlights.map(transaction.changes);
      const updated_doc = transaction.newDoc.sliceString(0);
      const file = processor.processSync(updated_doc);

      const summary: RetextSummary = {};
      for (const msg of file.messages) {
        if (!msg.source) {
          continue;
        }
        const start = msg.position?.start.offset || 0;
        const end = msg.position?.end.offset || 0;
        const new_class = pluginClass(msg.source);
        let skip = false;
        new_highlights.between(start, end, (start, end, value) => {
          if ((value as any).class === new_class) {
            skip = true;
            return false;
          }
        });
        if (!skip) {
          new_highlights = new_highlights.update({
            add: [
              Decoration.mark({
                class: new_class,
              }).range(start, end),
            ],
          });
        }
        if (summary.hasOwnProperty(msg.source)) {
          summary[msg.source] += 1;
        } else {
          summary[msg.source] = 1;
        }
      }
      populateSummary(summary);
      return new_highlights;
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
        c.addOption("show", "Show")
          .addOption("hide", "Hide")
          .setValue(this.plugin.settings.defaultVisibility)
          .onChange(async (value: "show" | "hide") => {
            this.plugin.settings.defaultVisibility = value;
            await this.plugin.saveSettings();
          });
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

class RetextSummaryView extends ItemView {
  settings: ObsidianRetextSettings;
  constructor(leaf: WorkspaceLeaf, settings: ObsidianRetextSettings) {
    super(leaf);
    this.settings = settings;
  }
  getViewType(): string {
    return "retext-summary";
  }
  getDisplayText(): string {
    return "Obsidian Retext Summary";
  }
  async onOpen(): Promise<void> {
    const sidebar = this.containerEl.children[1];
    sidebar.empty();
    sidebar.createEl("h2", { text: "Obsidian Retext" });
    const summary = sidebar.createDiv("retext-summary");
    if (this.settings.checkIntensify) {
      summary.createEl(
        "p",
        "retext-mark-intensify"
      ).innerHTML = `<span id="retext-intensify-count">0</span> sentences that could be intensified.`;
    }
    if (this.settings.checkReadability) {
      summary.createEl(
        "p",
        "retext-mark-readability"
      ).innerHTML = `<span id="retext-readability-count">0</span> sentences that are difficult to read`;
    }
    if (this.settings.checkPassive) {
      summary.createEl(
        "p",
        "retext-mark-passive"
      ).innerHTML = `<span id="retext-passive-count">0</span> sentences that use passive voice.`;
    }
    if (this.settings.checkSimplify) {
      summary.createEl(
        "p",
        "retext-mark-simplify"
      ).innerHTML = `<span id="retext-simplify-count">0</span> sentences that could be simplified.`;
    }
  }

  async onClose(): Promise<void> {}
}

interface RetextSummary {
  [key: string]: number;
}

function populateSummary(summary: RetextSummary) {
  let element = document.getElementById("retext-intensify-count");
  if (element) {
    element.innerText = String(summary["retext-intensify"]) || "0";
  }

  element = document.getElementById("retext-readability-count");
  if (element) {
    element.innerText = String(summary["retext-readability"]) || "0";
  }

  element = document.getElementById("retext-passive-count");
  if (element) {
    element.innerText = String(summary["retext-passive"]) || "0";
  }

  element = document.getElementById("retext-simplify-count");
  if (element) {
    element.innerText = String(summary["retext-simplify"]) || "0";
  }
}
