import { ExtensionContext, window } from 'vscode'
import { App } from './app'
import { Config } from './config'
import { registerCommands } from './commands'
import { Levels, logger, showErrorMessage } from './utils'
import manager from './manager'
import { DEBUG } from './constants'
import configuration from './managers/configuration'
import i18nManager from './managers/i18n'
import { ErrorMessage } from './config/message'

export function getDurationMilliseconds(start: [number, number]) {
  const [secs, nanosecs] = process.hrtime(start)
  return secs * 1000 + Math.floor(nanosecs / 1000000)
}

export async function activate(context: ExtensionContext) {
  logger.setLevel(DEBUG ? Levels.DEBUG : Levels.ERROR)
  logger.setOutput(window.createOutputChannel('Facility'))

  try {
    manager.configure(context)

    const config: Config = configuration.get()

    App.initialize(context, config)

    registerCommands(context)
  } catch (err) {
    showErrorMessage(i18nManager.format(ErrorMessage.AppFailedToStart))
  }
}
