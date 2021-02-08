import { Event, EventEmitter } from 'vscode'
import {
  ORIGIN_PATH,
} from '../config/pathConfig'
import { exist, mkdir, write } from '../utils'
import { fileSystem } from '../services/fileSystem'
import configuration from './configuration'

export interface IConfigurationDidChangedEvent {
  src: string
  dest: string
}

export class WorkspaceFolderChecker {
  constructor(public path = configuration.path) {}

  get root() {
    return ORIGIN_PATH
  }

  get defaultFile() {
    return configuration.examinee
  }

  async migrate(src: string = this.root, dest: string = this.root) {
    await fileSystem.migrate(src, dest)
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
