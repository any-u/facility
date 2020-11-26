import { window, Position } from 'vscode'
import i18n from '../i18n'

import {
  fullname,
  remove,
  data,
  stat,
  move,
  showErrorMessage,
  exist,
  mkdir,
  write,
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
          i18n.format(
            'extension.facilityApp.ErrorMessage.CannotFoundActiveTextEditor'
          )
        )
      }
    } catch (error) {
      showErrorMessage(
        `${i18n.format(
          'extension.facilityApp.ErrorMessage.ErrorStick'
        )} Error: ${error}`
      )
    }
  }

  async remove(path: string) {
    return remove(path)
  }

  mkdir(path: string) {
    mkdir(path)
  }
  migrateWorkspaceFolder(cfg: string, config: string) {
    move(cfg, config)
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
