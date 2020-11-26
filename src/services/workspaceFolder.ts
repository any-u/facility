import {
  ConfigurationChangeEvent,
  Disposable,
  Event,
  EventEmitter,
} from 'vscode'
import { configuration } from '../config'
import i18n from '../i18n'
import { showErrorMessage } from '../utils'
import { fileSystem } from './fileSystem'

export interface IConfigurationDidChangedEvent {
  from: string
  to: string
}

export class WorkspaceFolder {
  private _onConfigurationDidChanged = new EventEmitter<IConfigurationDidChangedEvent>()
  get onConfigurationDidChanged(): Event<IConfigurationDidChangedEvent> {
    return this._onConfigurationDidChanged.event
  }

  constructor(public path = configuration.appFolder()) {}

  get homeOriginFolder() {
    return configuration.homeOriginFolder
  }

  get defaultFile() {
    return configuration.defaultFile
  }

  async migrate(
    from: string = this.homeOriginFolder,
    to: string = this.homeOriginFolder
  ) {
    try {
      await fileSystem.migrateWorkspaceFolder(from, to)
      this._onConfigurationDidChanged.fire({
        from,
        to,
      })
      await fileSystem.remove(from)
    } catch (error) {
      showErrorMessage(
        `${i18n.format(
          'extension.facilityApp.ErrorMessage.FailedToMigrateCodeSnippet'
        )}${error}`
      )
    }
  }

  async run() {
    // 检查系统默认文件夹是否存在
    const isExist = fileSystem.exist(this.path)

    if (isExist) return
    fileSystem.mkdir(this.path)
    fileSystem.write(this.defaultFile, '')
  }
}
