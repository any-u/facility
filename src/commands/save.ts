import { env, FileType, Range, window } from 'vscode'
import { App } from '../app'
import { Comment, ErrorMessage, WarningMessage } from '../config/message'
import i18nManager from '../managers/i18n'
import {
  append,
  fullname,
  write,
  showSaveDiaglog,
  showWarningMessage,
  showErrorMessage,
} from '../utils'
import { Command, command, Commands } from './common'

@command()
export class Save extends Command {
  constructor() {
    super(Commands.Save)
  }

  async execute() {
    const text = await this.getText()
    if (!text) {
      showErrorMessage(
        i18nManager.format(ErrorMessage.CannotFoundContentToSave)
      )
      return
    }

    const { paths, nodes } = await this.getNodes()
    const selectOption = await window.showQuickPick(nodes)

    if (selectOption === undefined) {
      showWarningMessage(
        i18nManager.format(WarningMessage.CancelSaveCodeSnippetToLocal)
      )
    } else if (selectOption === i18nManager.format(Comment.SaveAsTitle)) {
      await this.onSaveAsSelected(text)
    } else {
      await this.onAppendSelected(paths, selectOption, text)
    }
  }

  private async getNodes() {
    const paths = await App.explorerTree.getFilterNodes((item: any) => {
      const {
        name,
        _element: { fileType },
      } = item.element
      if (fileType !== FileType.File) return
      return name
    })
    const nodes = [
      i18nManager.format(Comment.SaveAsTitle),
      ...paths.map((item) => fullname(item)),
    ]
    return {
      paths,
      nodes,
    }
  }

  private async getText(): Promise<string | undefined> {
    // get text from clipboard
    // return await env.clipboard.readText()

    // get text from selection
    const editor = window.activeTextEditor
    if (editor) {
      const { start, end } = editor.selection
      return editor.document.getText(new Range(start, end))
    } else {
      showErrorMessage(
        i18nManager.format(ErrorMessage.CannotFoundActiveTextEditor)
      )
      return undefined
    }
  }

  async onAppendSelected(paths: string[], selectOption: string, text: string) {
    const path = paths.find((item) => item.includes(selectOption))
    if (path !== undefined) {
      text = '\n' + text
      await append(path, text)
    } else {
      showWarningMessage(
        `${i18nManager.format(ErrorMessage.CannotFoundPath)}${path}`
      )
    }
  }
  async onSaveAsSelected(text: string) {
    const path = await showSaveDiaglog()
    if (path) {
      write(path, text)
    } else {
      showErrorMessage(
        `${i18nManager.format(ErrorMessage.CannotFoundPath)}${path}`
      )
    }
  }
}
