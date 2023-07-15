import { Plugin } from "obsidian";
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
  readingAge: number;
}

const DEFAULT_SETTINGS: ObsidianRetextSettings = {
  readingAge: 12,
};

export default class ObsidianRetextPlugin extends Plugin {
  settings: ObsidianRetextSettings;

  async onload() {
    await this.loadSettings();
    console.log("Loaded Obsidian Retext");
    this.registerEditorExtension([
      highlight_field(this.settings),
      highlight_theme,
    ]);
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

const highlight_theme = EditorView.theme(
  {
    [".retext-mark-intensify"]: {
      // Green
      backgroundColor: "#BBFABBA6",
    },
    [".retext-mark-passive"]: {
      // Blue
      backgroundColor: "#ADCCFFA6",
    },
    [".retext-mark-readibility"]: {
      // Orange
      backgroundColor: "#FFB86CA6",
    },
    [".retext-mark-simplify"]: {
      // Pink
      backgroundColor: "#FFB8EBA6",
    },
  },
  { dark: false }
);
