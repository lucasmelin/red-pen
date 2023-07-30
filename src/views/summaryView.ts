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
        "p"
      ).innerHTML = `<span class="red-pen-summary-intensify"><span id="red-pen-intensify-count">0</span> phrases that could be intensified.</span>`;
    }
    if (this.settings.checkPassive) {
      summary.createEl(
        "p"
      ).innerHTML = `<span class="red-pen-summary-passive"><span id="red-pen-passive-count">0</span> phrases that use passive voice.</span>`;
    }
    if (this.settings.checkReadability) {
      summary.createEl(
        "p"
      ).innerHTML = `<span class="red-pen-summary-readability"><span id="red-pen-readability-count">0</span> phrases that are difficult to read.</span>`;
    }
    if (this.settings.checkSimplify) {
      summary.createEl(
        "p"
      ).innerHTML = `<span class="red-pen-summary-simplify"><span id="red-pen-simplify-count">0</span> phrases that could be simplified.</span>`;
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
