import {
  Disposable,
  SymbolInformation,
  TreeItem,
  TreeItemCollapsibleState,
  workspace,
} from "vscode"
import App from "../../app"
import { Commands, CommandTitles } from "../../commands/common"
import { fileSystem } from "../../services"
import { getSymbolAfterTrimCache } from "../../views/nodes/symbolNode"
import { OutlineView } from "../outlineView"
import { ViewNode } from "./viewNode"

export class OutlineNode extends ViewNode<OutlineView> {
  constructor(view: OutlineView, public readonly symbol?: SymbolInformation) {
    super(view)
  }
  getTreeItem() {
    const label = this.symbol.name
    const item = new TreeItem(label, TreeItemCollapsibleState.None)
    item.iconPath = {
      dark: App.context.asAbsolutePath(`images/dark/icon-function.svg`),
      light: App.context.asAbsolutePath(`images/light/icon-function.svg`),
    }
    item.command = {
      title: CommandTitles.StickSymbol,
      command: Commands.StickSymbol,
      arguments: [this],
    }
    return item
  }
  async getChildren() {
    if (!this.view.path) {
      // TODO: MessageNode
      return []
    }

    const symbols = await getSymbolAfterTrimCache(this.view.path)

    if (symbols.children.length === 0) {
      // TODO: MessageNode
      return []
    }

    return symbols.children.map(
      (item) => new OutlineNode(this.view, item.symbol)
    )
  }
  async triggerSymbolSticked() {
    const { uri, range } = this.symbol.location

    const document = await workspace.openTextDocument(uri.path)
    fileSystem.edit(document.getText(range))
  }
}
