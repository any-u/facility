import {
  Disposable,
  FileType,
  TreeItem,
  TreeItemCollapsibleState,
} from 'vscode'
import { ContextValues, ViewNode } from '.'
import { App } from '../../app'
import { Commands } from '../../commands'
import { fileSystem } from '../../services'
import { GistElement, TExplorerTreeNode } from '../../tree/explorerTree'
import { isDblclick } from '../../utils'
import { ExplorerView } from '../explorerView'
import { MessageNode } from './common'
import { SubscribeableViewNode } from './viewNode'

export class RepositoryNode extends SubscribeableViewNode<ExplorerView> {
  private _children: (RepositoryNode | MessageNode)[] | undefined

  constructor(
    view: ExplorerView,
    public readonly element: GistElement,
    public readonly children: TExplorerTreeNode[]
  ) {
    super(view)
  }
  async getChildren(): Promise<(RepositoryNode | MessageNode)[]> {
    const children: any[] = []
    const root = await App.explorerTree.getNode(
      this.element.name,
      FileType.Directory
    )

    if (!root || !root.children.length)
      return [new MessageNode(this.view, this, 'No nodes could be found')]

    root.children.forEach((item) =>
      children.push(new RepositoryNode(this.view, item.element, item.children))
    )

    this._children = children
    return this._children
  }

  getTreeItem() {
    const { name, element } = this.element
    const label = fileSystem.fullname(name)
    const item = new TreeItem(
      label,
      this.children.length
        ? TreeItemCollapsibleState.Expanded
        : TreeItemCollapsibleState.None
    )
    item.iconPath = this.adaptIcon(label, element.fileType)
    item.contextValue = ContextValues.Explorer
    item.command = {
      title: 'Stick Gist',
      command: Commands.StickGist,
      arguments: [this],
    }
    return item
  }

  onExplorerTreeNodesChanged() {
    void this.triggerChange()
  }

  subscribe() {
    return Disposable.from(
      App.explorerTree.onDidChangeNodes(this.onExplorerTreeNodesChanged, this)
    )
  }

  triggerGistSticked() {
    const { name } = this.element
    const content = fileSystem.getFileText(name)

    if (isDblclick(this)) {
      fileSystem.edit(content)
    } else {
      App.outlineView.path = name
    }
  }
}
