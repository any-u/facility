import * as path from 'path'
import { ExtensionContext, ConfigurationChangeEvent, Uri } from 'vscode'
import { Config } from './config'
import { ExplorerView } from './views/explorerView'
import { OutlineView } from './views/outlineView'
import { ExplorerTree, GistElement } from './tree/explorerTree'
import monitor, { Monitor } from './managers/monitor'
import {
  ConfigurationName,
  CONFIGURED_PATH,
  HIDDEN_FILENAME,
  ORIGIN_PATH,
} from './config/pathConfig'
import configuration from './managers/configuration'
import { fileSystem } from './services'

export class App {
  private static _onConfigurationSetting: Map<
    ConfigurationName,
    boolean
  > = new Map()

  private static _context: ExtensionContext
  static get context() {
    return this._context
  }

  private static _config: Config | undefined
  static get config() {
    if (this._config === undefined) {
      this._config = configuration.get()
    }
    return this._config
  }

  private static _explorerView: ExplorerView | undefined
  static get ExplorerView(): ExplorerView {
    if (this._explorerView === undefined) {
      this._context.subscriptions.push(
        (this._explorerView = new ExplorerView())
      )
    }

    return this._explorerView
  }

  private static _outlineView: OutlineView | undefined
  static get outlineView(): OutlineView {
    if (this._outlineView === undefined) {
      this._context.subscriptions.push((this._outlineView = new OutlineView()))
    }

    return this._outlineView
  }

  private static _explorerTree: ExplorerTree<GistElement>
  static get explorerTree() {
    return this._explorerTree
  }

  static initialize(context: ExtensionContext, config: Config) {
    this._context = context
    this._config = config

    context.subscriptions.push(
      configuration.onDidChange(this.onConfigurationChanging, this)
    )
    context.subscriptions.push(
      (this._explorerTree = new ExplorerTree<GistElement>())
    )

    context.subscriptions.push((this._explorerView = new ExplorerView()))
    context.subscriptions.push((this._outlineView = new OutlineView()))
  }

  private static async onConfigurationChanging(e: ConfigurationChangeEvent) {
    if (configuration.changed(e, ConfigurationName.WorkspaceFolder)) {
      const onConfigurationSetting = this._onConfigurationSetting.get(
        ConfigurationName.WorkspaceFolder
      )
      if (onConfigurationSetting) return

      this._onConfigurationSetting.set(ConfigurationName.WorkspaceFolder, true)

      let cfg = this._config?.workspaceFolder,
        config = configuration.get(ConfigurationName.WorkspaceFolder)

      cfg = cfg ? path.join(cfg, HIDDEN_FILENAME) : ORIGIN_PATH
      config = config ? path.join(config, HIDDEN_FILENAME) : ORIGIN_PATH

      if (cfg === config) {
        this._onConfigurationSetting.set(
          ConfigurationName.WorkspaceFolder,
          false
        )
        return
      }

      await fileSystem.migrate(cfg, config)

      this._explorerTree.clear()

      monitor.reset(this._context, CONFIGURED_PATH)

      this._config = configuration.get()
      this._onConfigurationSetting.set(ConfigurationName.WorkspaceFolder, false)
    }
  }
}
