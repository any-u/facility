import { WorkspaceFolderChecker } from './workspaceFolder'
import { SymbolProviderChecker } from './symbolProviderChecker'
import { Configuration } from '../config'
import { I18nManager } from './i18n'
import { ExtensionContext } from 'vscode'
import { Monitor } from './monitor'

export const enum Project {
  WorkspaceFolderChecker = 'workspaceFolder',
  SymbolProviderChecker = 'symbolProviderChecker',
  Configuration = 'configuration',
  I18nManager = 'i18nManager',
  Monitor = 'monitor',
}

export type Runner =
  | WorkspaceFolderChecker
  | SymbolProviderChecker
  | Configuration
  | I18nManager
  | Monitor

class Manager {
  managers = new Map<Project, Runner>()

  registry(project: Project, script: Runner) {
    this.managers.set(project, script)
  }

  configure(ctx: ExtensionContext) {
    this.managers.forEach((script) => {
      return script.init(ctx)
    })
  }
}

const manager = new Manager()

export default manager
