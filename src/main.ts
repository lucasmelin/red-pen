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
            class: "retext-mark",
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

const highlight_theme = EditorView.theme(
  {
    [".retext-mark"]: {
      // Bright green
      backgroundColor: "#0cf032",
    },
  },
  { dark: false }
);
