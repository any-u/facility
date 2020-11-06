import * as path from 'path'
import { ExtensionContext, ConfigurationChangeEvent, Uri } from 'vscode'
import { configuration, ConfigurationWillChangeEvent, fs } from './services'
import { Config } from './config'
import { RepositoriesView } from './views/repositoriesView'
import { TreeService } from './repo/tree'
import { OutlineView } from './views/outlineView'

export class App {
  private static _onConfigurationSetting: Map<string, boolean> | undefined
  private static _configsAffectedByMode: string[] | undefined
  private static _applyModeConfigurationTransformBound:
    | ((e: ConfigurationChangeEvent) => ConfigurationChangeEvent)
    | undefined

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


  private static _repositoriesView: RepositoriesView | undefined
  static get repositoriesView(): RepositoriesView {
    if (this._repositoriesView === undefined) {
      this._context.subscriptions.push(
        (this._repositoriesView = new RepositoriesView())
      )
    }

    return this._repositoriesView
  }

  private static _outlineView: OutlineView | undefined
  static get outlineView(): OutlineView {
    if (this._outlineView === undefined) {
      this._context.subscriptions.push((this._outlineView = new OutlineView()))
    }

    return this._outlineView
  }

  private static _tree: TreeService
  static get tree() {
    return this._tree
  }

  static initialize(context: ExtensionContext, config: Config) {
    this._context = context
    this._config = config

    context.subscriptions.push(
      configuration.onWillChange(this.onConfigurationChanging, this)
    )

    context.subscriptions.push((this._tree = new TreeService()))

    context.subscriptions.push(
      (this._repositoriesView = new RepositoriesView())
    )
    context.subscriptions.push((this._outlineView = new OutlineView()))

  }

  private static onConfigurationChanging(e: ConfigurationWillChangeEvent) {

    if (configuration.changed(e.change, 'workspaceFolder')) {
      // 路径输入后执行函数未执行完之前， 不允许再次执行
      const onConfigurationSetting = this._onConfigurationSetting?.get(
        'workspaceFolder'
      )

      if (
        onConfigurationSetting === undefined ||
        onConfigurationSetting === false
      ) {
        this._onConfigurationSetting?.set('workspaceFolder', true)

        if (this._applyModeConfigurationTransformBound === undefined) {
          this._applyModeConfigurationTransformBound = this.applyModeConfigurationTransform.bind(
            this
          )
        }

        let cfg = this._config?.workspaceFolder,
          config = configuration.get('workspaceFolder')

        cfg = cfg ? path.join(cfg, '.fl') : configuration.defaultFolder()
        config = config
          ? path.join(config, '.fl')
          : configuration.defaultFolder()

        fs.workspaceFolderMigrate(cfg, config)

        this._config = configuration.get()
        e.transform = this._applyModeConfigurationTransformBound
        this._onConfigurationSetting?.set('workspaceFolder', false)
      }
    }
  }

  private static applyModeConfigurationTransform(
    e: ConfigurationChangeEvent
  ): ConfigurationChangeEvent {
    if (this._configsAffectedByMode === undefined) {
      this._configsAffectedByMode = [
        `facility.${configuration.name('workspaceFolder')}`,
      ]
    }

    const original = e.affectsConfiguration
    return {
      ...e,
      affectsConfiguration: (section: string, resource?: Uri) => {
        if (
          this._configsAffectedByMode &&
          this._configsAffectedByMode.some((n) => section.startsWith(n))
        ) {
          return true
        }
        return original(section, resource)
      },
    }
  }
}
