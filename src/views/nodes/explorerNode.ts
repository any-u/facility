import { Disposable, TreeItem, TreeItemCollapsibleState } from "vscode"
import App from "../../app"
import { ContextValues } from "../../config"
import { RepositoryNode } from "./repositoryNode"
import { ExplorerView } from "../explorerView"
import { SubscribeableViewNode, ViewNode } from "./viewNode"
import { MessageNode } from "./common"
import i18nManager from "../../managers/i18n"
import { Message } from "../../config/message"

export class ExplorerNode extends SubscribeableViewNode<ExplorerView> {
  constructor(view, parent) {
    super(view, parent)
  }
  getTreeItem() {
    const item = new TreeItem(this.view.name, TreeItemCollapsibleState.Expanded)
    item.contextValue = ContextValues.Explorer
    return {}
  }

  getChildren() {
    const children = []
    const root = App.tree.getRoot()

    if (!root || !root.element) {
      return [
        new MessageNode(
          this.view,
          this,
          i18nManager.format(Message.CannotFoundTreeNodes)
        ),
      ]
    }
    root.children.forEach((item) => {
      children.push(new RepositoryNode(this.view, this, item))
    })
    return children
  }

  subscribe():
    | Disposable
    | undefined
    | Promise<Disposable | undefined> {
    return Disposable.from(
      ...[App.tree.onDidChangeNodes(this.triggerChange, this)]
    )
  }
}
