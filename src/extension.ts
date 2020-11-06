// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { App } from './app'
import { Configuration, configuration } from './services'
import { Config } from './config'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  try {
    Configuration.configure(context)

    const config: Config = configuration.get()

    App.initialize(context, config)
  } catch (err) {
    console.log(err)
  }
}
