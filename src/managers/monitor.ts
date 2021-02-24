// @ts-ignore
import chokidar from 'chokidar'
import { EventEmitter, Event, ExtensionContext } from 'vscode'
import { logger, showErrorMessage } from '../utils'
import {  shouldFileIgnore } from '../config/pathConfig'
import i18nManager from './i18n'
import { ErrorMessage } from '../config/message'
import configuration from './configuration'

export enum FWChangeType {
  ADDDIR = 'addDir',
  ADD = 'add',
  CHANGE = 'change',
  UNLINK = 'unlink',
  UNLINKDIR = 'unlinkDir',
}

export interface MonitorChangeEvent {
  type: FWChangeType
  path: string
}

export class Monitor {
  #ctx: ExtensionContext
  #monitor: any | null
  #monitored: string

  init(context: ExtensionContext, path: string = configuration.path) {
    this.#ctx = context
    this.#monitored = path

    logger.info(`[facility] ${path} monitored`)

    this.#monitor = chokidar
      .watch(path, {
        ignored: configuration.examinee
      })
      .on('all', this.onFolderChanged.bind(this))
      .on('error', this.onDidWatcherError.bind(this))
    this.#ctx.subscriptions.push(this.#monitor)
  }

  private _onWillChange = new EventEmitter<MonitorChangeEvent>()
  get onWillChange(): Event<MonitorChangeEvent> {
    return this._onWillChange.event
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

  onFolderChanged(type: FWChangeType, path: string) {
    if (shouldFileIgnore(path)) return

    logger.info(`[facility] ${path} changed: ${type}`)

    const evt: MonitorChangeEvent = {
      path,
      type,
    }

    this._onWillChange.fire(evt)
  }
  onDidWatcherError(error: Error) {
    logger.error(
      '[facility] failed to monitor workspace folder:',
      error.message
    )
    showErrorMessage(
      `${i18nManager.format(ErrorMessage.ErrorFsWatch)} Error: ${error}`
    )
  }
}

const monitor = new Monitor()
export default monitor
