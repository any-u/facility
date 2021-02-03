import { window, Position } from 'vscode'
import { ErrorMessage } from '../config/message'
import i18nManager from '../managers/i18n'

import {
  fullname,
  remove,
  data,
  stat,
  showErrorMessage,
  exist,
  mkdir,
  write,
  copy,
} from '../utils'
import { showWarningMessage } from '../utils'

export enum FolderType {
  DIRECTORY = 'directory',
  FILE = 'file',
}

export interface RepoFileType {
  type: FolderType
  path: string
  name: string
}

class FileSystem {
  getFileText(path: string): string {
    const text = data(path)
    return text ? text : ''
  }

  async edit(text: string): Promise<void> {
    try {
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
        showWarningMessage(
          i18nManager.format(ErrorMessage.CannotFoundActiveTextEditor)
        )
      }
    } catch (error) {
      showErrorMessage(
        `${i18nManager.format(ErrorMessage.ErrorStick)} Error: ${error}`
      )
    }
  }

  async remove(path: string) {
    return remove(path)
  }

  mkdir(path: string) {
    mkdir(path)
  }
  migrate(cfg: string, config: string) {
    try {
      copy(cfg, config)
    } catch (error) {
      showErrorMessage(
        `${i18nManager.format(
          ErrorMessage.FailedToMigrateCodeSnippet
        )}${error}`
      )
    }
    cfg && remove(cfg)
  }

  exist(path: string) {
    return exist(path)
  }

  fullname(path: string) {
    return fullname(path)
  }

  isDirectory(path: string) {
    const statInfo = stat(path)
    return statInfo.isDirectory()
  }

  write<T>(path: string, data: T) {
    return write(path, data)
  }
}

export const fileSystem = new FileSystem()
