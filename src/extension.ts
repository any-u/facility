import { ExtensionContext, extensions } from 'vscode'
import { App } from './app'
import { Config, configuration, Configuration, extensionQualifiedId } from './config'
import { Watcher } from './reactive/watcher'
import { registerCommands } from './commands'
import { showErrorMessage } from './utils'
import i18n from './i18n'
import prepare from './prepare'
import { profiles } from './services/profile'

export function getDurationMilliseconds(start: [number, number]) {
  const [secs, nanosecs] = process.hrtime(start)
  return secs * 1000 + Math.floor(nanosecs / 1000000)
}

export async function activate(context: ExtensionContext) {
  const app = extensions.getExtension(extensionQualifiedId)!;
  prepare.runScript()

  try {
    Configuration.configure(context)
    profiles.configure({ state: context.globalState });
    Watcher.configure(context, configuration.appFolder)

    const config: Config = configuration.get()

    App.initialize(context, config)

    registerCommands(context)
  } catch (err) {
    showErrorMessage(
      i18n.format('extension.facilityApp.ErrorMessage.AppFailedToStart')
    )
  }
}
