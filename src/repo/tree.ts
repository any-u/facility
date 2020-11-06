import { Disposable, Event, EventEmitter } from 'vscode'
import { configuration } from '../config'
import { Repository } from './repository'
import { watcher } from './watcher'
import { TernarySearchTree } from '../system/searchTree'
import { FolderType } from '../services'

export interface RepoFolder {
  type: FolderType
  path: string
  name: string
}

export interface RepositoryFoldersChangeEvent {
  readonly added: ReadonlyArray<RepoFolder>
  readonly removed: ReadonlyArray<RepoFolder>
  readonly changed: ReadonlyArray<RepoFolder>
}

export class TreeService implements Disposable {
  private _onDidChangeRepositories = new EventEmitter<void>()
  get onDidChangeRepositories(): Event<void> {
    return this._onDidChangeRepositories.event
  }

  private _onDidChangeOutline = new EventEmitter<void>()
  get onDidChangeOutline(): Event<void> {
    return this._onDidChangeOutline.event
  }
  private readonly _disposable: Disposable
  private readonly _repositoryTree: TernarySearchTree<Repository>
  // private _repositoriesLoadingPromise: Promise<void> | undefined

  constructor() {
    this._repositoryTree = TernarySearchTree.forPaths()

    this._disposable = Disposable.from(
      watcher.onDidChangeRepoFolders(this.onRepoFoldersChanged, this)
    )

    //  this.onRepoFoldersChanged()
    this.initialize()
  }
  dispose() {
    this._disposable && this._disposable.dispose()
  }

  private async initialize() {
    await watcher.initialize(configuration.appFolder())
  }

  private async onRepoFoldersChanged(e?: RepositoryFoldersChangeEvent) {
    for (const f of e!.added) {
      const { name, path, type } = f
      const repository = new Repository(
        name,
        path,
        path === configuration.appFolder(),
        type
      )
      this._repositoryTree.set(repository.path, repository)
    }

    await this.updateContext()
  }

  private async updateContext() {
    this.fireChanged()
  }

  private fireChanged() {
    // TODO: 检验非指定outline不更新
    this._onDidChangeRepositories.fire()
    this._onDidChangeOutline.fire()
  }

  async getRepositories(
    predicate?: (repo: RepoFolder) => boolean
  ): Promise<any> {
    const repositoryTree = await this.getRepositoryTree()

    const values = repositoryTree.values()

    return predicate !== undefined ? (values as any).filter(predicate) : values
  }

  async getOrderedRepositories(): Promise<any[]> {
    const repositories = [...(await this.getRepositories())]
    if (repositories.length === 0) return repositories

    return repositories
  }

  getRepositoryTree() {
    return this._repositoryTree
  }

  getNode(key: string) {
    return this._repositoryTree.get(key)
  }

  async getChildren() {}
}
