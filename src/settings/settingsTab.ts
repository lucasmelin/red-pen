import { App, PluginSettingTab, Setting } from "obsidian";
import type RedPenPlugin from "src/plugin/main";

export class RedPenSettingsTab extends PluginSettingTab {
  plugin: RedPenPlugin;

  constructor(app: App, plugin: RedPenPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    new Setting(containerEl)
      .setName("Show Proofreader Highlights by Default")
      .setDesc("Show Red Pen proofreader highlights by default.")
      .addDropdown((c) => {
        c.addOption("show", "Show")
          .addOption("hide", "Hide")
          .setValue(this.plugin.settings.defaultVisibility)
          .onChange(async (value: "show" | "hide") => {
            this.plugin.settings.defaultVisibility = value;
            await this.plugin.saveSettings();
            // Toggle the highlights immediately to respect this setting.
            if (value) {
              document.body.addClass("show-red-pen");
            } else if (document.body.hasClass("show-red-pen")) {
              document.body.removeClass("show-red-pen");
            }
          });
      });
    new Setting(containerEl)
      .setName("Enable Intensify Highlights")
      .setDesc("Highlight weak or passive writing.")
      .addToggle((c) => {
        c.setValue(this.plugin.settings.checkIntensify).onChange(
          async (value) => {
            this.plugin.settings.checkIntensify = value;
            await this.plugin.saveSettings();
            if (!value) {
              const marked_words = document.querySelectorAll(
                ".red-pen-mark-intensify"
              );
              marked_words.forEach((word) => {
                // Remove class from each element.
                word.classList.remove("red-pen-mark-intensify");
              });
            }
          }
        );
      });
    new Setting(containerEl)
      .setName("Enable Passive Highlights")
      .setDesc("Highlight use of passive voice.")
      .addToggle((c) => {
        c.setValue(this.plugin.settings.checkPassive).onChange(
          async (value) => {
            this.plugin.settings.checkPassive = value;
            await this.plugin.saveSettings();
            if (!value) {
              const marked_words = document.querySelectorAll(
                ".red-pen-mark-passive"
              );
              marked_words.forEach((word) => {
                // Remove class from each element.
                word.classList.remove("red-pen-mark-passive");
              });
            }
          }
        );
      });
    new Setting(containerEl)
      .setName("Enable Simplify Highlights")
      .setDesc("Highlight words that could be simplified.")
      .addToggle((c) => {
        c.setValue(this.plugin.settings.checkSimplify).onChange(
          async (value) => {
            this.plugin.settings.checkSimplify = value;
            await this.plugin.saveSettings();
            if (!value) {
              const marked_words = document.querySelectorAll(
                ".red-pen-mark-simplify"
              );
              marked_words.forEach((word) => {
                // Remove class from each element.
                word.classList.remove("red-pen-mark-simplify");
              });
            }
          }
        );
      });
    new Setting(containerEl)
      .setName("Enable Readability Highlights")
      .setDesc("Highlight sentences that might be hard to read.")
      .addToggle((c) => {
        c.setValue(this.plugin.settings.checkReadability).onChange(
          async (value) => {
            this.plugin.settings.checkReadability = value;
            await this.plugin.saveSettings();
            if (!value) {
              const marked_words = document.querySelectorAll(
                ".red-pen-mark-readability"
              );
              marked_words.forEach((word) => {
                // Remove class from each element.
                word.classList.remove("red-pen-mark-readability");
              });
            }
          }
        );
      });
    new Setting(containerEl)
      .setName("Readability Reading Age")
      .setDesc("Set the reading age when checking for readability.")
      .addSlider((c) => {
        c.setValue(this.plugin.settings.readingAge)
          .setLimits(6, 18, 1)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.readingAge = value;
            await this.plugin.saveSettings();
          });
      });
    new Setting(containerEl)
      .setName("Readability Algorithm Threshold")
      .setDesc(
        "Set the number of algorithms that need to agree that a sentence is hard to read for the target age before it is highlighted."
      )
      .addSlider((c) => {
        c.setValue(this.plugin.settings.algorithmThreshold)
          .setLimits(1, 7, 1)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.algorithmThreshold = value;
            await this.plugin.saveSettings();
          });
      });
  }
}
