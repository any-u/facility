import { commands, Uri } from 'vscode'
import { configuration } from '../config'
import i18n from '../i18n'
import { showErrorMessage, showWarningMessage } from '../utils'
import { fileSystem } from './fileSystem'

export class WaitProvider {
  constructor() {}

  async waitSymbolProvider() {
    const tmp = configuration.defaultFile
    const tmpUri = Uri.file(tmp)
    await fileSystem.write(tmp, '')

    for (let i = 0; i < 30; i++) {
      const vsSyms = await commands.executeCommand(
        'vscode.executeDocumentSymbolProvider',
        tmpUri
      )
      if (vsSyms) return true

      await new Promise((r) => setTimeout(r, 1000))
    }

    showErrorMessage(
      i18n.format(
        'extension.facilityApp.ErrorMessage.FailedToRegisterSymbolProvider'
      )
    )
    return false
  }

  async run() {
    await this.waitSymbolProvider()
  }
}
