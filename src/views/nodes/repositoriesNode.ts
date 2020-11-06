import { Disposable, TreeItem, TreeItemCollapsibleState } from 'vscode'
import { App } from '../../app'
import { RepositoriesView } from '../repositoriesView'
import { RepositoryNode } from './repositoryNode'
import { ContextValues, ViewNode } from './viewNode'
import { SubscribeableViewNode } from './viewNode'

export enum RepositoriesType {
  File = 'File',
  Folder = 'Folder',
}

export class RepositoriesNode extends SubscribeableViewNode<RepositoriesView> {
  private _children: RepositoryNode[] | undefined

  constructor(
    view: RepositoriesView,
    path: string,
    parent: ViewNode | null,
  ) {
    super(view, path, parent)
  }

  async getChildren(): Promise<ViewNode[]> {
    if (this._children === undefined) {
      const repositories = App.tree.getNode(this.path!)
      
      if (!repositories) return []

      this._children = [new RepositoryNode(this.view, this, repositories)]
    }
    return this._children
  }

  async getTreeItem() {
    const item = new TreeItem('Repositories', TreeItemCollapsibleState.Expanded)
    item.contextValue = ContextValues.Repositories
    return item
  }


  protected subscribe() {
    const subscriptions= [App.tree.onDidChangeRepositories(this.onRepositoriesChanged, this)]

    return Disposable .from(...subscriptions);
  }

  onRepositoriesChanged() {
    void this.triggerChange();
  }
}
