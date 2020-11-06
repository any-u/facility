import { Uri, FileType, window, TextEditorEdit, Position } from 'vscode'
import * as path from 'path'
import { file } from '../utils'
import { win } from './index'
import { getDirent, readdirWithFileTypes } from '../file/pfs'
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
  async getFileOrFolder(
    fullpath: string
  ): Promise<[string, FileType][] | (string | FileType)[][]> {
    // ensure folder path exist
    this.ensureFolderExist(fullpath)

    const files = file.listFile(fullpath)
    return files
      ? files.map((item: string) => {
          const stat = file.stat(fullpath + path.sep + item)
          return [item, stat.isDirectory() ? 2 : 1]
        })
      : []
  }

  private ensureFolderExist(fullpath) {
    return file.mkdir(fullpath)
  }

  async createDirent(path): Promise<RepoFileType> {
    const dirent = await getDirent(path)
    return this.normalize(dirent, path, dirent.isDirectory())
  }
  private async normalize(
    dirent: Dirent,
    fullpath: string,
    directory: boolean
  ): Promise<RepoFileType> {
    return {
      name: dirent.name,
      type: directory ? FolderType.DIRECTORY : FolderType.FILE,
      path: fullpath,
    }
    /**
     *  name
     *  type
     *  path
     *  parent
     */
  }
  // TODO: 补充返回类型
  async getFileList(fullpath: string) {
    try {
      let result: any = {
        directory: [],
        file: [],
      }
      const files = await readdirWithFileTypes(fullpath)

      let r = await Promise.all(
        files.map(
          async (item) =>
            await this.normalize(
              item,
              path.resolve(fullpath, item.name),
              item.isDirectory()
            )
        )
      )

      for (let item of r) {
        if (item.type === FolderType.DIRECTORY) {
          result.directory.push(item)
        }
        if (item.type === FolderType.FILE) {
          result.file.push(item)
        }
      }
      return result
    } catch (err) {
      console.log(err)
    }
  }

  getFileText(fullpath: string): string {
    const text = file.data(fullpath)
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
  async openText(fullpath: string) {
    return await window.showTextDocument(Uri.file(fullpath))
  }

  async createAndInsertFile(fullpath: string, data: string) {
    this.ensureFolderExist(path.dirname(fullpath))
    return file.write(fullpath, data)
  }

  async renameFile(oldPath: string, newPath: string) {
    return file.mv(oldPath, newPath)
  }

  deleteFile(fullpath: string) {
    return file.remove(fullpath)
  }

  workspaceFolderMigrate(cfg: string, config: string) {
    file.move(cfg, config)
    cfg && file.remove(cfg)
  }

  extname(fullpath: string) {
    return file.basename(fullpath)
  }
}

export const fs = new FileSystem()
