import { Plugin } from "obsidian";
import { ServiceLocator } from "./core/ServiceLocator";
import { CommandRegistry } from "./core/CommandRegistry";
import { SettingsManager } from "./managers/SettingsManager";

export default class ChatGPT_MD extends Plugin {
  private serviceLocator: ServiceLocator;
  private commandRegistry: CommandRegistry;
  private settingsManager: SettingsManager;

  async onload() {
    this.settingsManager = new SettingsManager(this);
    await this.settingsManager.addSettingTab();

    this.serviceLocator = new ServiceLocator(this.app);

    this.commandRegistry = new CommandRegistry(this, this.serviceLocator, this.settingsManager);
    this.commandRegistry.registerCommands();
  }
}
