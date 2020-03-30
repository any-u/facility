import * as path from "path";
import { ExtensionContext, ConfigurationChangeEvent, Uri } from "vscode";
import { configuration, ConfigurationWillChangeEvent, fs } from "./services";
import { SidebarView } from "./views/view";
import { SettingsWebview } from "./webviews/settingsWebview";
import { Config } from "./config";

export class Container {
  private static _onConfigurationSetting: Map<string, boolean> | undefined;
  private static _configsAffectedByMode: string[] | undefined;
  private static _applyModeConfigurationTransformBound:
    | ((e: ConfigurationChangeEvent) => ConfigurationChangeEvent)
    | undefined;

  private static _context: ExtensionContext;
  static get context() {
    return this._context;
  }

  private static _config: Config | undefined;
  static get config() {
    if (this._config === void 0) {
      this._config = configuration.get();
    }
    return this._config;
  }

  private static _view: SidebarView;
  static get view() {
    return this._view;
  }

  private static _settingsview: SettingsWebview;
  static get settingsview() {
    return this._settingsview;
  }

  static initialize(context: ExtensionContext, config: Config) {
    this._context = context;
    this._config = config;

    context.subscriptions.push(
      configuration.onWillChange(this.onConfigurationChanging, this)
    );

    context.subscriptions.push((this._view = new SidebarView("facility.view")));

    context.subscriptions.push((this._settingsview = new SettingsWebview()));
  }

  private static onConfigurationChanging(e: ConfigurationWillChangeEvent) {
    // this._config = undefined

    if (configuration.changed(e.change, "workspaceFolder")) {
      // 路径输入后执行函数未执行完之前， 不允许再次执行
      const onConfigurationSetting = this._onConfigurationSetting?.get(
        "workspaceFolder"
      );

      if (
        onConfigurationSetting === void 0 ||
        onConfigurationSetting === false
      ) {
        this._onConfigurationSetting?.set("workspaceFolder", true);

        if (this._applyModeConfigurationTransformBound === void 0) {
          this._applyModeConfigurationTransformBound = this.applyModeConfigurationTransform.bind(
            this
          );
        }

        let cfg = this._config?.workspaceFolder,
          config = configuration.get("workspaceFolder"),
          raw = cfg;

        cfg = cfg ? path.join(cfg, ".fl") : configuration.defaultFolder();
        config = config
          ? path.join(config, ".fl")
          : configuration.defaultFolder();

        fs.workspaceFolderMigrate(cfg, config, raw);

        this._config = configuration.get();
        e.transform = this._applyModeConfigurationTransformBound;
        this._onConfigurationSetting?.set("workspaceFolder", false);
      }
    }
  }

  private static applyModeConfigurationTransform(
    e: ConfigurationChangeEvent
  ): ConfigurationChangeEvent {
    if (this._configsAffectedByMode === undefined) {
      this._configsAffectedByMode = [
        `facility.${configuration.name("workspaceFolder")}`
      ];
    }

    const original = e.affectsConfiguration;
    return {
      ...e,
      affectsConfiguration: (section: string, resource?: Uri) => {
        if (
          this._configsAffectedByMode &&
          this._configsAffectedByMode.some(n => section.startsWith(n))
        ) {
          return true;
        }
        return original(section, resource);
      }
    };
  }
}
