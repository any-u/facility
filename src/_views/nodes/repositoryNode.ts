import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from "vscode"
import { HIDDEN_FILENAME } from "../../config/pathConfig"
import TreeNode from "../../tree/node"
import { ExplorerView } from "../../views/explorerView"
import { ContextValues } from "../../views/nodes"
import { View } from "../view"
import { ViewNode } from "./viewNode"

export class RepositoryNode extends ViewNode<ExplorerView> {
  constructor(view: View, parent: ViewNode, public readonly repo: TreeNode) {
    super(view, parent)
  }

  getTreeItem() {
    const { name, extension } = this.repo.element
    // if (name === HIDDEN_FILENAME) return null

    const item = new TreeItem(
      name,
      this.repo.children.length
        ? TreeItemCollapsibleState.Expanded
        : TreeItemCollapsibleState.None
    )

    item.iconPath = name === HIDDEN_FILENAME ? new ThemeIcon("root-folder") : ""
    item.contextValue = ContextValues.Explorer
    // item

    return item
  }

  getChildren() {
    const children: RepositoryNode[] = []
    // if(!this.repo.children.length)
    this.repo.children.forEach((item) => {
      children.push(new RepositoryNode(this.view, this, item))
    })

    return children
  }
}
