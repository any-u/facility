import manager, { Project } from './managers/manager'

import configuration from './managers/configuration'
import i18nManager from './managers/i18n'
// import symbolProviderChecker from './managers/symbolProviderChecker'
import workspaceFolder from './managers/workspaceFolder'
import monitor from './managers/monitor'

manager.registry(Project.WorkspaceFolderChecker, workspaceFolder)
// manager.registry(Project.SymbolProviderChecker, symbolProviderChecker)
manager.registry(Project.Configuration, configuration)
manager.registry(Project.I18nManager, i18nManager)
manager.registry(Project.Monitor, monitor)

export default manager
