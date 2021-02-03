import { Event, EventEmitter } from 'vscode'
import { CONFIGURED_PATH, DEFAULT_FILE, ORIGIN_PATH } from '../config/pathConfig'
import { exist, mkdir, write } from '../utils'
import { fileSystem } from '../services/fileSystem'

export interface IConfigurationDidChangedEvent {
  src: string
  dest: string
}

export class WorkspaceFolderChecker {
  private _onConfigurationDidChanged = new EventEmitter<IConfigurationDidChangedEvent>()
  get onConfigurationDidChanged(): Event<IConfigurationDidChangedEvent> {
    return this._onConfigurationDidChanged.event
  }

  constructor(public path = CONFIGURED_PATH) {}

  get root() {
    return ORIGIN_PATH
  }

  get defaultFile() {
    return DEFAULT_FILE
  }

  async migrate(src: string = this.root, dest: string = this.root) {
    await fileSystem.migrate(src, dest)
    this._onConfigurationDidChanged.fire({
      src,
      dest,
    })
  }

  async init() {
    // 检查系统默认文件夹是否存在
    if (exist(this.path)) return

    mkdir(this.path)
    write(this.defaultFile, '')
  }
}

const workspaceFolderChecker = new WorkspaceFolderChecker()
export default workspaceFolderChecker
