// @ts-ignore
import chokidar from 'chokidar'
import {
  EventEmitter,
  Event,
  FileType,
  FileChangeType,
  ExtensionContext,
} from 'vscode'
import { logger, showErrorMessage } from '../utils'
import { CONFIGURED_PATH } from '../config/pathConfig'
import i18nManager from './i18n'
import { ErrorMessage } from '../config/message'

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

export class Monitor {
  #ctx: ExtensionContext
  #monitor: any | null

  init(context: ExtensionContext, path: string = CONFIGURED_PATH) {
    this.#ctx = context

    logger.info(`Watch Dir ${path}`)
    this.#monitor = chokidar
      .watch(path)
      .on('all', this.onFolderChanged.bind(this))
      .on('error', this.onDidWatcherError.bind(this))
    this.#ctx.subscriptions.push(this.#monitor)
  }

  private _onWillChange = new EventEmitter<IFoldersChangeEvent>()
  get onWillChange(): Event<IFoldersChangeEvent> {
    return this._onWillChange.event
  }

  checkIgnore(path: string) {
    return path.includes('.DS_Store')
  }

  close() {
    const watcherIndex = this.#ctx.subscriptions.findIndex(
      (item) => item === this.#monitor
    )

    if (watcherIndex > 0) {
      this.#ctx.subscriptions.splice(watcherIndex, 1)
    }

    this.#monitor.close()
    this.#monitor = null
  }

  reset(ctx: ExtensionContext, path: string) {
    this.close()

    this.init(ctx, path)
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
      `${i18nManager.format(ErrorMessage.ErrorFsWatch)} Error: ${error}`
    )
  }
}

const monitor = new Monitor()
export default monitor
