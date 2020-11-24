import { env, FileType, window } from 'vscode'
import { App } from '../app'
import { Language } from '../config/language'
import { append, fullname, write } from '../utils'
import { showSaveDiaglog, showWarningMessage } from '../utils/window'
import { Command, command, Commands } from './common'

@command()
export class Save extends Command {
  constructor() {
    super(Commands.Save)
  }

  async execute() {
    const text = await env.clipboard.readText()

    const { paths, nodes } = await this.getNodes()
    const selectOption = await window.showQuickPick(nodes)

    if (selectOption === undefined) {
      showWarningMessage('Unsave the code snippet to the local')
    } else if (selectOption === Language.saveAs) {
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
    const nodes = [Language.saveAs, ...paths.map((item) => fullname(item))]
    return {
      paths,
      nodes,
    }
  }

  async onAppendSelected(paths: string[], selectOption: string, text: string) {
    const path = paths.find((item) => item.includes(selectOption))
    if (path !== undefined) {
      text = '\n' + text
      await append(path, text)
    } else {
      console.warn(`cannot found the path: ${path}`)
    }
  }
  async onSaveAsSelected(text: string) {
    const path = await showSaveDiaglog()
    if (path) {
      write(path, text)
    } else {
      console.warn(`cannot found the path: ${path}`)
    }
  }
}
