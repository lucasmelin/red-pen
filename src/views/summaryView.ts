import { ItemView, WorkspaceLeaf } from "obsidian";
import { ObsidianRetextSettings } from "src/settings/settingsData";

export class RetextSummaryView extends ItemView {
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

export interface RetextSummary {
  [key: string]: number;
}

export function populateSummary(summary: RetextSummary) {
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
