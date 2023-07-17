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
      .setName("Show Highlights")
      .setDesc("Show Red Pen highlights.")
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
      .setName("Enable Intensify")
      .setDesc("Highlight weak or passive writing.")
      .addToggle((c) => {
        c.setValue(this.plugin.settings.checkIntensify).onChange(
          async (value) => {
            this.plugin.settings.checkIntensify = value;
            await this.plugin.saveSettings();
          }
        );
      });
    new Setting(containerEl)
      .setName("Enable Passive")
      .setDesc("Highlight use of passive voice.")
      .addToggle((c) => {
        c.setValue(this.plugin.settings.checkPassive).onChange(
          async (value) => {
            this.plugin.settings.checkPassive = value;
            await this.plugin.saveSettings();
          }
        );
      });
    new Setting(containerEl)
      .setName("Enable Simplify")
      .setDesc("Highlight words that could be simplified.")
      .addToggle((c) => {
        c.setValue(this.plugin.settings.checkSimplify).onChange(
          async (value) => {
            this.plugin.settings.checkSimplify = value;
            await this.plugin.saveSettings();
          }
        );
      });
    new Setting(containerEl)
      .setName("Enable Readability")
      .setDesc("Highlight sentences that might be hard to read ")
      .addToggle((c) => {
        c.setValue(this.plugin.settings.checkReadability).onChange(
          async (value) => {
            this.plugin.settings.checkReadability = value;
            await this.plugin.saveSettings();
          }
        );
      });
    new Setting(containerEl)
      .setName("Readability Reading Age")
      .setDesc("Set the reading age when checking for readibility")
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
