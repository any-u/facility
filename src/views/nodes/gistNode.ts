import {
  Disposable,
  TreeItem,
  TreeItemCollapsibleState,
} from 'vscode'
import { GistTree } from '../../repo/gistTree'
import { RepoFolder } from '../../repo/tree'
import { fs } from '../../services'
import { RepositoriesView } from '../repositoriesView'
import { SubscribeableViewNode } from './viewNode'

export class GistNode extends SubscribeableViewNode<RepositoriesView> {
  public readonly tree: GistTree

  constructor(view: RepositoriesView, public readonly repo: RepoFolder) {
    super(view, '')

    this.tree = new GistTree(repo.name, repo.path)
  }

  getChildren() {
    return []
  }

  getTreeItem() {
    const label = this.repo.name
    const item = new TreeItem(label, TreeItemCollapsibleState.None)
    item.iconPath = this.adaptIcon(label)
    item.command = {
      title: `Stick Gist`,
      command: 'facility.views.repositories.stick',
      arguments: [this],
    }

    return item
  }

  triggerStick(details: string) {
    fs.edit(details)
  }

  subscribe() {
    return Disposable.from()
  }
}
