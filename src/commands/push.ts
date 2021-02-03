import { ConfigurationTarget, FileType, window } from 'vscode'
import * as _ from 'lodash'
import { App } from '../app'
import { dropRoot, ensureValidState, resolve } from '../config'
import { GIST_DESCRIPTION, GIST_FILE } from '../constants'
import { gists, Snippet } from '../services/gist'
import {
  fullname,
  logger,
  openTextDocument,
  extend,
  showErrorMessage,
} from '../utils'
import { Request } from '../utils/request'
import { command, Command, Commands } from './common'
import configuration from '../managers/configuration'
import { ConfigurationName } from '../config/pathConfig'
import i18nManager from '../managers/i18n'
import { ErrorMessage } from '../config/message'

interface SelectionOption {
  label: string
  detail: string
}

export async function composeSnippet(
  name: string,
  path: string
): Promise<Snippet> {
  const document = await openTextDocument(path)
  return {
    name,
    path: dropRoot(path),
    content: document.getText(),
  }
}

export function composeSnippetData(snippets: Snippet[]) {
  return {
    [GIST_FILE]: {
      content: JSON.stringify(snippets),
    },
    cloudSettings: {
      content: JSON.stringify({ lastUpload: new Date() }),
    },
  }
}
@command()
export class Push extends Command {
  constructor() {
    super(Commands.Push)
  }
  async execute() {
    const shouldPull = ensureValidState()
    if (!shouldPull) {
      return
    }

    const selections = await this.getSelections()
    const selectOption = await window.showQuickPick(selections, {
      canPickMany: true,
    })
    if (!selectOption.length) return

    const local = await Promise.all(
      selectOption.map(async (item) => {
        const data = await composeSnippet(item.label, item.detail)
        return data
      })
    )

    const id = configuration.get(ConfigurationName.Id)
    if (!id) {
      try {
        const data = await composeSnippetData(local)
        const res = await await gists.create({
          description: GIST_DESCRIPTION,
          files: data,
          public: true,
        })
        configuration.update(
          ConfigurationName.Id,
          res.data.id,
          ConfigurationTarget.Global
        )
      } catch (err) {
        showErrorMessage(i18nManager.format(ErrorMessage.NetworkAbort))
        logger.error(i18nManager.format(ErrorMessage.NetworkAbort), err.message)
      }
      return
    }

    const remote = await this.fetchSnippet(id)

    const snippets = []
    for (let i = 0; i < remote.length; i++) {
      const index = _.findIndex(
        local,
        (o: any) => o.path === resolve(remote[i].path)
      )
      if (index > 0) {
        snippets.push(extend(remote, local[index]))
      } else {
        snippets.push(remote)
      }
    }

    const data = composeSnippetData(snippets)
    try {
      await gists.update({
        files: data,
        gist_id: id,
      })
    } catch (err) {
      showErrorMessage(i18nManager.format(ErrorMessage.NetworkAbort))
      logger.error(i18nManager.format(ErrorMessage.NetworkAbort), err.message)
    }
  }

  private async getSelections(): Promise<SelectionOption[]> {
    return await App.explorerTree.getFilterNodes((item: any) => {
      const {
        name,
        _element: { fileType },
      } = item.element
      if (fileType !== FileType.File) return
      return {
        label: fullname(name),
        detail: name,
      }
    })
  }

  private async fetchSnippet(id?: string): Promise<Snippet[]> | undefined {
    try {
      if (!id) return
      const response = await gists.list({
        per_page: 9999,
      })
      const snippets = response.data.find((item) => item.id === id)
      if (!snippets) return

      return await Request.get(snippets.files[GIST_FILE].raw_url)
    } catch (err) {
      throw err
    }
  }
}
