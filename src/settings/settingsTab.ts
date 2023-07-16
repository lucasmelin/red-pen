import { App, PluginSettingTab, Setting } from "obsidian";
import type ObsidianRetextPlugin from "src/plugin/main";

export class ObsidianRetextSettingsTab extends PluginSettingTab {
  plugin: ObsidianRetextPlugin;

  constructor(app: App, plugin: ObsidianRetextPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    new Setting(containerEl)
      .setName("Show Highlights")
      .setDesc("Show retext highlights")
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
      .setName("Check Intensify")
      .setDesc("Highlight weak or passive writing")
      .addToggle((c) => {
        c.setValue(this.plugin.settings.checkIntensify).onChange(
          async (value) => {
            this.plugin.settings.checkIntensify = value;
            await this.plugin.saveSettings();
          }
        );
      });
    new Setting(containerEl)
      .setName("Check Passive")
      .setDesc("Highlight use of passive voice")
      .addToggle((c) => {
        c.setValue(this.plugin.settings.checkPassive).onChange(
          async (value) => {
            this.plugin.settings.checkPassive = value;
            await this.plugin.saveSettings();
          }
        );
      });
    new Setting(containerEl)
      .setName("Check Simplify")
      .setDesc("Highlight words that could be simplified")
      .addToggle((c) => {
        c.setValue(this.plugin.settings.checkSimplify).onChange(
          async (value) => {
            this.plugin.settings.checkSimplify = value;
            await this.plugin.saveSettings();
          }
        );
      });
  }
}
