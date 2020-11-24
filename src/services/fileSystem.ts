import { Uri, FileType, window, TextEditorEdit, Position } from 'vscode'
import * as path from 'path'
import {
  getDirent,
  readdirWithFileTypes,
  fullname,
  mv,
  remove,
  data,
  mkdir,
  stat,
  write,
  listFile,
  move,
} from '../utils'
import { win } from './index'
import { Dirent } from 'fs-extra'

export enum FolderType {
  DIRECTORY = 'directory',
  FILE = 'file',
}

export interface RepoFileType {
  type: FolderType
  path: string
  name: string
}

/*
 * windows will throw error `vscode unable to resolve filesystem provider with relative file path "C:/..."`
 * it's a magic bug, and can not find method to resolve
 * use file.listFile instead of fs.readDirectory
 */

class FileSystem {

  getFileText(fullpath: string): string {
    const text = data(fullpath)
    return text ? text : ''
  }

  async edit(data: string): Promise<void> {
    try {
      // FIXME:
      // Make editor be the active textEditor all the time.
      // because if oepn other file and close
      // will not make the editor be the active textEditor.
      const editor = window.activeTextEditor

      if (!editor) {
        console.error('Failed to found Editor. Please open the Editor.')
        win.showWarningMessage('未找到编辑窗口，请打开窗口重试!')
        win.setStatusBarMessage('⚠未找到编辑窗口，请打开窗口重试!')
        return
      }
      editor.edit((builder: TextEditorEdit) => {
        builder.insert(
          new Position(
            editor!.selection.end.line,
            editor!.selection.end.character
          ),
          data
        )
      })
    } catch (error) {
      console.log(error)
    }
  }

  migrateWorkspaceFolder(cfg: string, config: string) {
    move(cfg, config)
    cfg && remove(cfg)
  }

  fullname(fullpath: string) {
    return fullname(fullpath)
  }

  isDirectory(fullpath: string) {
    const statInfo = stat(fullpath)
    return statInfo.isDirectory()
  }
}

export const fileSystem = new FileSystem()
