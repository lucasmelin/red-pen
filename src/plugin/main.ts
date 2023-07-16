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
import { ObsidianRetextSettingsTab } from "src/settings/settingsTab";
import {
  ObsidianRetextSettings,
  DEFAULT_SETTINGS,
} from "src/settings/settingsData";
import {
  RetextSummary,
  RetextSummaryView,
  populateSummary,
} from "src/views/summaryView";

export default class ObsidianRetextPlugin extends Plugin {
  manifest: PluginManifest;
  settings: ObsidianRetextSettings;

  async onload(): Promise<void> {
    await this.loadSettings();
    console.log(`Obsidian Retext v${this.manifest.version} loaded`);
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

  onunload(): void {
    console.log(`Obsidian Retext unloaded`);
    this.app.workspace.detachLeavesOfType("retext-summary");
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async activateView(): Promise<void> {
    this.app.workspace.detachLeavesOfType("retext-summary");

    await this.app.workspace.getRightLeaf(false).setViewState({
      type: "retext-summary",
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType("retext-summary")[0]
    );
  }

  async deactivateView(): Promise<void> {
    this.app.workspace.detachLeavesOfType("retext-summary");
  }
}

function highlight_field(
  settings: ObsidianRetextSettings
): StateField<DecorationSet> {
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
