import { resolve as PResolve, ensureValidState } from '../config'
import { gists, Snippet } from '../services/gist'
import {
  logger,
  Request,
  showErrorMessage,
  showInformationMessage,
  showWarningMessage,
  write,
} from '../utils'
import { command, Command, Commands } from './common'
import { GIST_FILE } from '../constants'
import i18nManager from '../managers/i18n'
import { ErrorMessage, SuccessMessage, WarningMessage } from '../config/message'
import configuration from '../managers/configuration'
import { ConfigurationName } from '../config/pathConfig'

@command()
export class Pull extends Command {
  constructor() {
    super(Commands.Pull)
  }
  async execute() {
    const shouldPull = ensureValidState()
    if (!shouldPull) {
      return
    }

    const response = await gists.list()
    if (!response.data) {
      logger.error(i18nManager.format(ErrorMessage.NetworkAbort))

      showErrorMessage(i18nManager.format(ErrorMessage.NetworkAbort))
      return
    }

    const id = configuration.get(ConfigurationName.Id)
    if (!id) {
      logger.warn(i18nManager.format(WarningMessage.NoGistId))
      showWarningMessage(i18nManager.format(WarningMessage.NoGistId))
      return
    }

    let results = response.data.filter((item) => item.id === id)
    if (!results.length) {
      logger.info(i18nManager.format(WarningMessage.NoRemoteSnippet))
      showWarningMessage(i18nManager.format(WarningMessage.NoRemoteSnippet))
      return
    }

    const item = results[0].files[GIST_FILE]
    let value = []

    try {
      value = await Request.get(item.raw_url)
    } catch (err) {
      showErrorMessage(i18nManager.format(ErrorMessage.NetworkAbort))
      logger.error(i18nManager.format(ErrorMessage.NetworkAbort), err.message)
    }

    try {
      await this.onWillSaveSnippets(value)
      showInformationMessage(i18nManager.format(SuccessMessage.PullComplete))
    } catch (err) {
      logger.error(err.message)
    }
  }

  async onWillSaveSnippets(data: Snippet[]) {
    try {
      await Promise.allSettled(
        data.map(({ path, content }) => {
          return new Promise(async (resolve) => {
            await write(PResolve(path), content)
            resolve(void 0)
          })
        })
      )
    } catch (err) {
      throw err
    }
  }
}
