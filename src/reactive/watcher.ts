// @ts-ignore
import chokidar from 'chokidar'
import {
  EventEmitter,
  Event,
  FileType,
  FileChangeType,
  ExtensionContext,
} from 'vscode'
import i18n from '../i18n'
import { logger, showErrorMessage } from '../utils'

export enum FolderChangeEvent {
  ADDDIR = 'addDir',
  ADD = 'add',
  CHANGE = 'change',
  UNLINK = 'unlink',
  UNLINKDIR = 'unlinkDir',
}

interface ITransformFileChangeType {
  type: FileChangeType
  fileType: FileType
}

export interface IFoldersChangeEvent extends ITransformFileChangeType {
  path: string
}

export class Watcher {
  static configure(context: ExtensionContext, watchDir: string) {
    logger.info(`Watch Dir ${watchDir}`)
    context.subscriptions.push(
      (watcher._watcher = chokidar
        .watch(watchDir)
        .on('all', watcher.onFolderChanged.bind(watcher))
        .on('error', watcher.onDidWatcherError.bind(watcher))
      )
    )
  }

  private _onWillChange = new EventEmitter<IFoldersChangeEvent>()
  get onWillChange(): Event<IFoldersChangeEvent> {
    return this._onWillChange.event
  }

  _watcher: any | undefined

  checkIgnore(path: string) {
    return path.includes('.DS_Store')
  }

  static close() {
    watcher._watcher.close()
  }

  onFolderChanged(event: FolderChangeEvent, path: string) {
    logger.info(event, path)
    if (this.checkIgnore(path)) return

    const e = this.transform(event)
    if (!e) return

    const evt: IFoldersChangeEvent = {
      path,
      ...e,
    }

    this._onWillChange.fire(evt)
  }

  transform(event: FolderChangeEvent): ITransformFileChangeType | null {
    let changeType: ITransformFileChangeType | null
    switch (event) {
      case FolderChangeEvent.ADD:
        changeType = {
          type: FileChangeType.Created,
          fileType: FileType.File,
        }
        break

      case FolderChangeEvent.ADDDIR:
        changeType = {
          type: FileChangeType.Created,
          fileType: FileType.Directory,
        }
        break
      case FolderChangeEvent.CHANGE:
        changeType = {
          type: FileChangeType.Changed,
          fileType: FileType.File,
        }
        break
      case FolderChangeEvent.UNLINK:
        changeType = {
          type: FileChangeType.Deleted,
          fileType: FileType.File,
        }
        break
      case FolderChangeEvent.UNLINKDIR:
        changeType = {
          type: FileChangeType.Deleted,
          fileType: FileType.Directory,
        }
        break
      default:
        changeType = null
        break
    }
    return changeType
  }
  onDidWatcherError(error: Error) {
    logger.error(error.message)
    showErrorMessage(
      `${i18n.format(
        'extension.facilityApp.ErrorMessage.ErrorFsWatch'
      )} Error: ${error}`
    )
  }
}

export const watcher = new Watcher()
