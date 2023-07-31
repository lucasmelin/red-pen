import { ItemView, WorkspaceLeaf } from "obsidian";
import { RedPenSettings } from "src/settings/settingsData";
import { text } from "stream/consumers";

export class RedPenSummaryView extends ItemView {
  settings: RedPenSettings;
  constructor(leaf: WorkspaceLeaf, settings: RedPenSettings) {
    super(leaf);
    this.settings = settings;
  }
  getViewType(): string {
    return "red-pen-summary";
  }
  getDisplayText(): string {
    return "Red Pen Summary";
  }
  async onOpen(): Promise<void> {
    const sidebar = this.containerEl.children[1];
    sidebar.empty();
    sidebar.createEl("h2", { text: "Red Pen Summary" });
    const summary = sidebar.createDiv("red-pen-summary");
    if (this.settings.checkIntensify) {
      const intensify_text = summary.createEl("p").createSpan({
        cls: "red-pen-summary-intensify",
      });
      intensify_text.createSpan({
        attr: { id: "red-pen-intensify-count" },
        text: "0",
      });
      intensify_text.createSpan({
        text: " phrases that could be intensified.",
      });
    }
    if (this.settings.checkPassive) {
      const passive_text = summary.createEl("p").createSpan({
        cls: "red-pen-summary-passive",
      });
      passive_text.createSpan({
        attr: { id: "red-pen-passive-count" },
        text: "0",
      });
      passive_text.createSpan({ text: " phrases that use passive voice." });
    }
    if (this.settings.checkReadability) {
      const readability_text = summary.createEl("p").createSpan({
        cls: "red-pen-summary-readability",
      });
      readability_text.createSpan({
        attr: { id: "red-pen-readability-count" },
        text: "0",
      });
      readability_text.createSpan({
        text: " phrases that are difficult to read.",
      });
    }
    if (this.settings.checkSimplify) {
      const simplify_text = summary.createEl("p").createSpan({
        cls: "red-pen-summary-simplify",
      });
      simplify_text.createSpan({
        attr: { id: "red-pen-simplify-count" },
        text: "0",
      });
      simplify_text.createSpan({
        text: " phrases that could be simplified.",
      });
    }
  }

  async onClose(): Promise<void> {}
}

export interface RedPenSummary {
  [key: string]: number;
}

export function populateSummary(summary: RedPenSummary) {
  let element = document.getElementById("red-pen-intensify-count");
  if (element) {
    const count = summary["retext-intensify"];
    if (count !== undefined) {
      element.innerText = String(count);
    } else {
      element.innerText = "0";
    }
  }

  element = document.getElementById("red-pen-readability-count");
  if (element) {
    const count = summary["retext-readability"];
    if (count !== undefined) {
      element.innerText = String(count);
    } else {
      element.innerText = "0";
    }
  }

  element = document.getElementById("red-pen-passive-count");
  if (element) {
    const count = summary["retext-passive"];
    if (count !== undefined) {
      element.innerText = String(count);
    } else {
      element.innerText = "0";
    }
  }

  element = document.getElementById("red-pen-simplify-count");
  if (element) {
    const count = summary["retext-simplify"];
    if (count !== undefined) {
      element.innerText = String(count);
    } else {
      element.innerText = "0";
    }
  }
}
