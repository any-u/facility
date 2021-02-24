import {
  Disposable,
  ThemeIcon,
  TreeItem,
  TreeItemCollapsibleState,
} from "vscode"
import App from "../../app"
import { Commands, CommandTitles } from "../../commands/common"
import { HIDDEN_FILENAME } from "../../config/pathConfig"
import { fileSystem } from "../../services"
import TreeNode from "../../tree/node"
import { isDblclick } from "../../utils"
import { ExplorerView } from "../explorerView"
import { ContextValues } from "../../config"
import { SubscribeableViewNode, ViewNode } from "./viewNode"

export class RepositoryNode extends SubscribeableViewNode<ExplorerView> {
  constructor(
    view: ExplorerView,
    parent: ViewNode,
    public readonly repo: TreeNode
  ) {
    super(view, parent)
  }

  getTreeItem() {
    const { name, extension } = this.repo.element

    const item = new TreeItem(
      name,
      this.repo.children.length
        ? TreeItemCollapsibleState.Expanded
        : TreeItemCollapsibleState.None
    )

    item.iconPath = name === HIDDEN_FILENAME ? new ThemeIcon("root-folder") : ""
    item.contextValue = ContextValues.Explorer
    item.tooltip = this.repo.path
    item.command = {
      title: CommandTitles.StickSnippet,
      command: Commands.StickSnippet,
      arguments: [this],
    }

    return item
  }

  getChildren() {
    const children: RepositoryNode[] = []
    this.repo.children.forEach((item) => {
      children.push(new RepositoryNode(this.view, this, item))
    })

    return children
  }

  subscribe(): Disposable | undefined | Promise<Disposable | undefined> {
    return Disposable.from(
      ...[App.tree.onDidChangeNodes(this.triggerChange, this)]
    )
  }

  triggerSnippetSticked() {
    const { path } = this.repo

    const content = fileSystem.getFileText(path)

    if (isDblclick(this)) {
      fileSystem.edit(content)
    } else {
      App.outlineView.candidate = path
    }
  }
}
