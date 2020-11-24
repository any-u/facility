// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, extensions } from 'vscode'
import { App } from './app'
import { Configuration, configuration } from './services'
import { Config, extensionQualifiedId } from './config'
import { Watcher } from './reactive/watcher'
import { registerCommands } from './commands'

export function getDurationMilliseconds(start: [number, number]) {
  const [secs, nanosecs] = process.hrtime(start)
  return secs * 1000 + Math.floor(nanosecs / 1000000)
}

export async function activate(context: ExtensionContext) {
  const start = process.hrtime()

  const facility = extensions.getExtension(extensionQualifiedId)
  const facilityVersion = facility?.packageJSON.version
  try {
    Configuration.configure(context)
    Watcher.configure(context, configuration.appFolder())

    const config: Config = configuration.get()

    App.initialize(context, config)

    registerCommands(context)

    console.log(
      `Facility (v${facilityVersion}) activated \u2022 ${getDurationMilliseconds(
        start
      )} ms`
    )
  } catch (err) {
    console.log(err)
  }
}
