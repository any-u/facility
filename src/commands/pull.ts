import { resolve as PResolve, configuration, ensureValidState } from '../config'
import { gists, Snippet } from '../services/gist'
import {
  logger,
  Request,
  showErrorMessage,
  showInformationMessage,
  showWarningMessage,
} from '../utils'
import { command, Command, Commands } from './common'
import { GIST_FILE } from '../constants'
import { fileSystem } from '../services'
import i18n from '../i18n'

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
      logger.error(
        i18n.format('extension.facilityApp.ErrorMessage.NetworkAbort')
      )

      showErrorMessage(
        i18n.format('extension.facilityApp.ErrorMessage.NetworkAbort')
      )
      return
    }

    const id = configuration.get('id')
    if (!id) {
      logger.warn(i18n.format('extension.facilityApp.WarningMessage.NoGistId'))
      showWarningMessage(
        i18n.format('extension.facilityApp.WarningMessage.NoGistId')
      )
      return
    }

    let results = response.data.filter((item) => item.id === id)
    if (!results.length) {
      logger.info(
        i18n.format('extension.facilityApp.WarningMessage.NoRemoteSnippet')
      )
      showWarningMessage(
        i18n.format('extension.facilityApp.WarningMessage.NoRemoteSnippet')
      )
      return
    }

    const item = results[0].files[GIST_FILE]
    let value = []

    try {
      value = await Request.get(item.raw_url)
    } catch (err) {
      showErrorMessage(
        i18n.format('extension.facilityApp.ErrorMessage.NetworkAbort')
      )
      logger.error(
        i18n.format('extension.facilityApp.ErrorMessage.NetworkAbort'),
        err.message
      )
    }

    try {
      await this.onWillSaveSnippets(value)
      showInformationMessage(
        i18n.format('extension.facilityApp.SuccessMessage.pull.complete')
      )
    } catch (err) {
      logger.error(err.message)
    }
  }

  async onWillSaveSnippets(data: Snippet[]) {
    try {
      await Promise.allSettled(
        data.map(({ path, content }) => {
          return new Promise(async (resolve) => {
            // TODO: 移除 fileSystem，意义在哪里呢？
            await fileSystem.write(PResolve(path), content)
            resolve(void 0)
          })
        })
      )
    } catch (err) {
      throw err
    }
  }
}
