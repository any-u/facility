import {
  Disposable,
  ThemeIcon,
  TreeItem,
  TreeItemCollapsibleState,
} from 'vscode'
import { App } from '../../app'
import { Repository } from '../../repo/repository'
import { configuration, fs } from '../../services'
import { RepositoriesView } from '../repositoriesView'
import { MessageNode } from './common'
import { GistNode } from './gistNode'
import { RepositoriesNode } from './repositoriesNode'
import { SubscribeableViewNode } from './viewNode'

export class RepositoryNode extends SubscribeableViewNode<RepositoriesView> {
  private _children: RepositoryNode[] | GistNode[] | MessageNode[] | undefined

  constructor(
    view: RepositoriesView,
    public parent: RepositoriesNode,
    public readonly repo: Repository
  ) {
    super(view, '')
  }

  async getChildren(): Promise<RepositoryNode[] | GistNode[] | MessageNode[]> {
    const repositories = await fs.getFileList(this.repo.path)

    if (!repositories.directory.length && !repositories.file.length)
      return [
        new MessageNode(this.view, this, 'No repositories could be found.'),
      ]

    const children = [] as any[]
    for (let dir of repositories.directory) {
      const repository = new Repository(dir.name, dir.path, false, dir.type)
      let node = new RepositoryNode(this.view, this.parent, repository)
      children.push(node)
    }

    for (let dir of repositories.file) {
      let node = new GistNode(this.view, dir)
      children.push(node)
    }

    this._children = children
    return this._children
  }

  getTreeItem() {
    const label = this.repo.formattedName
    const item = new TreeItem(label, TreeItemCollapsibleState.Expanded)
    item.iconPath =
      this.repo.path === configuration.appFolder()
        ? {
            dark: App.context.asAbsolutePath(`images/dark/icon-repo.svg`),
            light: App.context.asAbsolutePath(`images/light/icon-repo.svg`),
          }
        : ThemeIcon.Folder
    return item
  }

  subscribe() {
    return Disposable.from()
  }
}
