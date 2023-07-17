import { ItemView, WorkspaceLeaf } from "obsidian";
import { RedPenSettings } from "src/settings/settingsData";

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
      summary.createEl(
        "p",
        "red-pen-mark-intensify"
      ).innerHTML = `<span id="red-pen-intensify-count">0</span> sentences that could be intensified.`;
    }
    if (this.settings.checkReadability) {
      summary.createEl(
        "p",
        "red-pen-mark-readability"
      ).innerHTML = `<span id="red-pen-readability-count">0</span> sentences that are difficult to read.`;
    }
    if (this.settings.checkPassive) {
      summary.createEl(
        "p",
        "red-pen-mark-passive"
      ).innerHTML = `<span id="red-pen-passive-count">0</span> sentences that use passive voice.`;
    }
    if (this.settings.checkSimplify) {
      summary.createEl(
        "p",
        "red-pen-mark-simplify"
      ).innerHTML = `<span id="red-pen-simplify-count">0</span> sentences that could be simplified.`;
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
    element.innerText = String(summary["red-pen-intensify"]) || "0";
  }

  element = document.getElementById("red-pen-readability-count");
  if (element) {
    element.innerText = String(summary["red-pen-readability"]) || "0";
  }

  element = document.getElementById("red-pen-passive-count");
  if (element) {
    element.innerText = String(summary["red-pen-passive"]) || "0";
  }

  element = document.getElementById("red-pen-simplify-count");
  if (element) {
    element.innerText = String(summary["red-pen-simplify"]) || "0";
  }
}
