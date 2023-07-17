import { Plugin, PluginManifest } from "obsidian";
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
import { RedPenSettingsTab } from "src/settings/settingsTab";
import { RedPenSettings, DEFAULT_SETTINGS } from "src/settings/settingsData";
import {
  RedPenSummary,
  RedPenSummaryView,
  populateSummary,
} from "src/views/summaryView";

export default class RedPenPlugin extends Plugin {
  manifest: PluginManifest;
  settings: RedPenSettings;

  async onload(): Promise<void> {
    await this.loadSettings();
    console.log(`Red Pen v${this.manifest.version} loaded`);
    this.registerEditorExtension([highlight_field(this.settings)]);
    console.log(`Plugin registered`);
    this.addSettingTab(new RedPenSettingsTab(this.app, this));
    console.log(`Setting Tab added`);
    this.registerView(
      "red-pen-summary",
      (leaf) => new RedPenSummaryView(leaf, this.settings)
    );
    if (this.settings.defaultVisibility === "show") {
      document.body.addClass("show-red-pen");
      this.activateView();
    }
    this.addCommand({
      id: "toggle-red-pen-highlights",
      name: "Toggle Red Pen Highlights",
      callback: () => {
        if (document.body.hasClass("show-red-pen")) {
          document.body.removeClass("show-red-pen");
          this.deactivateView();
        } else {
          document.body.addClass("show-red-pen");
          this.activateView();
        }
      },
    });
  }

  onunload(): void {
    console.log(`Red Pen unloaded`);
    this.app.workspace.detachLeavesOfType("red-pen-summary");
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async activateView(): Promise<void> {
    this.app.workspace.detachLeavesOfType("red-pen-summary");

    await this.app.workspace.getRightLeaf(false).setViewState({
      type: "red-pen-summary",
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType("red-pen-summary")[0]
    );
  }

  async deactivateView(): Promise<void> {
    this.app.workspace.detachLeavesOfType("red-pen-summary");
  }
}

function highlight_field(settings: RedPenSettings): StateField<DecorationSet> {
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
          threshold: settings.algorithmThreshold,
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

      const summary: RedPenSummary = {};
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
      return "red-pen-mark-intensify";
    case "retext-passive":
      return "red-pen-mark-passive";
    case "retext-readability":
      return "red-pen-mark-readability";
    case "retext-simplify":
      return "red-pen-mark-simplify";
    default:
      return "";
  }
}
