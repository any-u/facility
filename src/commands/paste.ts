import { Position, window } from 'vscode'
import * as paths from 'path'
import { configuration } from '../config'
import {
  openTextDocument,
  showErrorMessage,
  showInputBox,
  showWarningMessage,
} from '../utils'
import { command, Command, Commands } from './common'
import { fileSystem } from '../services'
import i18n from '../i18n'

@command()
export class Paste extends Command {
  constructor() {
    super(Commands.Paste)
  }

  async execute() {
    const input = await showInputBox({
      prompt: i18n.format('extension.facilityApp.command.paste.description'),
    })

    if (input) {
      await this.onKeywordInputed(input)
    } else {
      showWarningMessage(
        i18n.format(
          'extension.facilityApp.WarningMessage.CancelPasteCodeSnippetToCurrentFile'
        )
      )
    }
  }

  async onKeywordInputed(input: string) {
    const config = configuration.get('keywords')
    if (config) {
      const path = paths.resolve(
        configuration.appFolder(),
        Reflect.get(config, input)
      )
      await this.paste(path)
    } else {
      showErrorMessage(
        i18n.format(
          'extension.facilityApp.ErrorMessage.CannotFoundConfigurationInformation'
        )
      )
    }
  }

  async paste(path: string) {
    let text = ''
    try {
      const document = await openTextDocument(path)
      text = document.getText()
    } catch (error) {
      showErrorMessage(
        `${i18n.format(
          'extension.facilityApp.ErrorMessage.CannotReadFile'
        )}${path}`
      )
    }
    await fileSystem.edit(text)
  }
}
