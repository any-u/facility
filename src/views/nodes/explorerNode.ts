import { Disposable, TreeItem, TreeItemCollapsibleState } from 'vscode'
import { ContextValues, ViewNode } from '.'
import { App } from '../../app'
import { Message } from '../../config/message'
import i18nManager from '../../managers/i18n'
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
      return [
        new MessageNode(
          this.view,
          this,
          i18nManager.format(Message.CannotFoundTreeNodes)
        ),
      ]
    }

    children.push(
      new RepositoryNode(this.view, root.element, root.children)
    )

    this._children = children
    return this._children as any
  }

  getTreeItem() {
    const item = new TreeItem(this.view.name, TreeItemCollapsibleState.Expanded)
    item.contextValue = ContextValues.Explorer
    return item
  }

  refresh() {
    this.onExplorerTreeNodesChanged()
  }

  onExplorerTreeNodesChanged() {
    void this.triggerChange()
  }

  subscribe() {
    return Disposable.from(
      App.explorerTree.onDidChangeNodes(this.onExplorerTreeNodesChanged, this)
    )
  }
}
