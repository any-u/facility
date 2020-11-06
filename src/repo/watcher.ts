import chokidar from 'chokidar'
import { EventEmitter, Event, Disposable } from 'vscode'
import { getExtname } from '../file/pfs'
import { RepoFolder } from '../repo/tree'
import { FolderType } from '../services'

export interface IRepoFoldersChangeEvent {
  added: RepoFolder[]
  removed: RepoFolder[]
  changed: RepoFolder[]
}

export enum IFolderChangeType {
  ADDDIR = 'addDir',
  ADD = 'add',
  CHANGE = 'change',
  UNLINK = 'unlink',
  UNLINKDIR = 'unlinkDir',
}


export class Watcher implements Disposable {
  private _onDidChangeRepoFolders = new EventEmitter<IRepoFoldersChangeEvent>()
  get onDidChangeRepoFolders(): Event<IRepoFoldersChangeEvent> {
    return this._onDidChangeRepoFolders.event
  }

  private _disposable: Disposable | undefined
  private _watcher: any | undefined

  constructor() {
    // this.initialize()
  }

  dispose() {
    this._disposable && this._disposable.dispose()
  }

  public async initialize(watchDir: string) {
    this._watcher = chokidar
      .watch(watchDir)
      .on('all', (event, path) => {
        this.onRepoWillChange(event, path)
      })

    this._disposable = Disposable.from(
      this._watcher,
      this._watcher.on('error', this.onDidWatcherError, this)
    )
  }
  toAddedRepoFolder(event: IFolderChangeType, path: string) {
    if (event !== IFolderChangeType.ADD && event !== IFolderChangeType.ADDDIR)
      return []

    if (event === IFolderChangeType.ADD) {
      return [
        {
          type: FolderType.FILE,
          path,
          name: getExtname(path),
        },
      ]
    }
    if (event === IFolderChangeType.ADDDIR) {
      return [
        {
          type: FolderType.DIRECTORY,
          path,
          name: getExtname(path)
        },
      ]
    }

    return []
  }
  toRemovedRepoFolder(event: IFolderChangeType, path: string) {
    if (
      event !== IFolderChangeType.UNLINK &&
      event !== IFolderChangeType.UNLINKDIR
    ) {
      return []
    }

    if (event === IFolderChangeType.UNLINK) {
      return [
        {
          type: FolderType.FILE,
          path,
          name: getExtname(path)
        },
      ]
    }
    if (event === IFolderChangeType.UNLINKDIR) {
      return [
        {
          type: FolderType.DIRECTORY,
          path,
          name: getExtname(path)
        },
      ]
    }

    return []
  }
  toChangedRepoFolder(event: IFolderChangeType, path: string) {
    if (event !== IFolderChangeType.CHANGE) return []

    return [
      {
        type: FolderType.FILE,
        path,
        name: getExtname(path)
      },
    ]
  }
  onRepoWillChange(event, path) {

    if (path.includes('.DS_Store')) return

    let result: IRepoFoldersChangeEvent = {
      added: [],
      removed: [],
      changed: [],
    }

    result.added = [...this.toAddedRepoFolder(event, path)]

    result.removed = [...this.toRemovedRepoFolder(event, path)]

    result.changed = [...this.toChangedRepoFolder(event, path)]

    this._onDidChangeRepoFolders.fire(result)
  }
  onDidWatcherError(error) {
    console.log('watch file system error, ', error)
  }

  // private compareFolder(currentFolders: any[], newFolders:)`
}

export const watcher = new Watcher()
