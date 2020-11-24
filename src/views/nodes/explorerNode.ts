import { Disposable, TreeItem, TreeItemCollapsibleState } from 'vscode'
import { ContextValues, ViewNode } from '.'
import { App } from '../../app'
import { ExplorerView } from '../explorerView'
import { MessageNode } from './common'
import { RepositoryNode } from './repositoryNode'
import { SubscribeableViewNode } from './viewNode'

export class ExplorerNode extends SubscribeableViewNode<ExplorerView> {
  private _children: any[] | undefined

  constructor(view: ExplorerView, private isRoot?: Boolean) {
    super(view)
  }
  async getChildren(): Promise<ViewNode[]> {
    const children = []
    const root = await App.explorerTree.getRoot()

    if (!root || !root.element) {
      return [new MessageNode(this.view, this, 'No nodes could be found')]
    }

    // FIXME: 修复anyScript
    children.push(
      new RepositoryNode(this.view, root.element, (root as any).children)
    )

    this._children = children
    return this._children as any
  }

  getTreeItem() {
    const item = new TreeItem('Explorer', TreeItemCollapsibleState.Expanded)
    item.contextValue = ContextValues.Explorer
    return item
  }

  subscribe() {
    return Disposable.from()
  }
}
