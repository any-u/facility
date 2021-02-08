import { commands, Uri } from 'vscode'
import { logger } from '../utils'
import { fileSystem } from '../services/fileSystem'
// import { DEFAULT_FILE } from '../config/pathConfig'
import i18nManager from './i18n'
import { ErrorMessage } from '../config/message'
import configuration from './configuration'

export class SymbolProviderChecker {
  constructor() {}

  async checkSymbolProvider() {
    const tmp = configuration.examinee
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

    logger.warn(i18nManager.format(ErrorMessage.FailedToRegisterSymbolProvider))
    return false
  }

  async init() {
    await this.checkSymbolProvider()
  }
}

const symbolProviderchecker = new SymbolProviderChecker()
export default symbolProviderchecker
