import { Position, window } from 'vscode'
import * as paths from 'path'
import { configuration } from '../config'
import {
  openTextDocument,
  showErrorMessage,
  showInputBox,
  showWarningMessage,
} from '../utils/window'
import { command, Command, Commands } from './common'

@command()
export class Paste extends Command {
  constructor() {
    super(Commands.Paste)
  }

  async execute() {
    const input = await showInputBox({
      prompt: 'Please enter a keyword',
    })

    if (input) {
      await this.onKeywordInputed(input)
    } else {
      showWarningMessage(`Unpaste the code snippet to the current file`)
    }
  }

  async onKeywordInputed(input: string) {
    const config = configuration.get('keywords')
    if (config) {
      const path = paths.resolve(configuration.appFolder(), Reflect.get(config, input))
      await this.paste(path)
    } else {
      showWarningMessage(`Cannot found configuration information`)
    }
  }

  async paste(path: string) {
    let text = ''
    try {
      const document = await openTextDocument(path)
      text = document.getText()
    } catch (error) {
      showErrorMessage(`Cannot read file ${path}.`)
    }
    const editor = window.activeTextEditor
    if (editor) {
      const selection = editor.selection
      editor.edit((builder) => {
        builder.insert(
          new Position(selection.end.line, selection.end.character),
          text
        )
      })
    } else {
      showWarningMessage('Cannot found active text editor')
    }
  }
}
