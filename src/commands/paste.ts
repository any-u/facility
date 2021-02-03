import { Position, window } from 'vscode'
import * as paths from 'path'
import {
  openTextDocument,
  showErrorMessage,
  showInputBox,
  showWarningMessage,
} from '../utils'
import { command, Command, Commands } from './common'
import { fileSystem } from '../services'
import i18nManager from '../managers/i18n'
import { Comment, ErrorMessage, WarningMessage } from '../config/message'
import configuration from '../managers/configuration'
import { ConfigurationName, CONFIGURED_PATH } from '../config/pathConfig'

@command()
export class Paste extends Command {
  constructor() {
    super(Commands.Paste)
  }

  async execute() {
    const input = await showInputBox({
      prompt: i18nManager.format(Comment.PasteDescription),
    })

    if (input) {
      await this.onKeywordInputed(input)
    } else {
      showWarningMessage(
        i18nManager.format(WarningMessage.CancelPasteCodeSnippetToCurrentFile)
      )
    }
  }

  async onKeywordInputed(input: string) {
    const config = configuration.get(ConfigurationName.Keyword)
    if (config) {
      const path = paths.join(CONFIGURED_PATH, Reflect.get(config, input))
      await this.paste(path)
    } else {
      showErrorMessage(
        i18nManager.format(ErrorMessage.CannotFoundConfigurationInformation)
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
        `${i18nManager.format(ErrorMessage.CannotReadFile)}${path}`
      )
    }
    await fileSystem.edit(text)
  }
}
