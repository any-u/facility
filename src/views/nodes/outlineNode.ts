import {
  commands,
  Disposable,
  SymbolInformation,
  SymbolKind,
  ThemeIcon,
  TreeItem,
  TreeItemCollapsibleState,
  Uri,
  workspace,
} from "vscode"
import App from "../../app"
import { Commands, CommandTitles } from "../../commands/common"
import { Message } from "../../config/message"
import configuration from "../../managers/configuration"
import i18nManager from "../../managers/i18n"
import { fileSystem } from "../../services"
import { OutlineView } from "../outlineView"
import { MessageNode } from "./common"
import { SubscribeableViewNode } from "./viewNode"

class SymbolNode {
  parent?: SymbolNode
  symbol: SymbolInformation
  children: SymbolNode[]

  constructor(symbol?: SymbolInformation) {
    this.children = []
    this.symbol = symbol
  }

  addChild(child: SymbolNode) {
    child.parent = this
    this.children.push(child)
  }
}

export class OutlineNode extends SubscribeableViewNode<OutlineView> {
  constructor(view: OutlineView, public readonly symbol?: SymbolInformation) {
    super(view)
  }
  getTreeItem() {
    const label = this.symbol.name
    const item = new TreeItem(label, TreeItemCollapsibleState.None)
    item.iconPath = new ThemeIcon("symbol-function")
    item.command = {
      title: CommandTitles.StickSymbol,
      command: Commands.StickSymbol,
      arguments: [this],
    }
    return item
  }

  async getChildren() {
    if (!this.view.candidate) {
      return [
        new MessageNode(
          this.view,
          this,
          i18nManager.format(Message.CannotProvideOutlineInformation)
        ),
      ]
    }

    const symbols: any = await this.getSymbol(this.view.candidate)

    if (symbols.children.length === 0) {
      return [
        new MessageNode(
          this.view,
          this,
          i18nManager.format(Message.CannotFoundTreeNodes)
        ),
      ]
    }

    return symbols.children.map(
      (item) => new OutlineNode(this.view, item.symbol)
    )
  }

  async getSymbol(path: string) {
    await this.getPureSymbol(configuration.examinee) // Cancel the file symbol cache
    return await this.getPureSymbol(path)
  }

  async getPureSymbol(path: string) {
    const tree = new SymbolNode()
    const uri = Uri.file(path)
    let symbols = (await commands.executeCommand<SymbolInformation[]>(
      "vscode.executeDocumentSymbolProvider",
      uri
    )) as any
    if (!symbols) return tree

    const symbolNodes = symbols
      .filter((symbol: any) => symbol.kind === SymbolKind.Function)
      .map((symbol: any) => new SymbolNode(symbol))
    let potentialParents: SymbolNode[] = []
    symbolNodes.forEach((currentNode: any) => {
      // Drop candidates that do not contain the current symbol range
      potentialParents = potentialParents.filter(
        (node) =>
          node !== currentNode &&
          node.symbol.location.range.contains(
            currentNode.symbol.location.range
          ) &&
          !node.symbol.location.range.isEqual(currentNode.symbol.location.range)
      )
      if (!potentialParents.length) {
        tree.addChild(currentNode)
      } else {
        const parent = potentialParents[potentialParents.length - 1]
        parent.addChild(currentNode)
      }
      potentialParents.push(currentNode)
    })

    return tree
  }

  subscribe(): Disposable | undefined | Promise<Disposable | undefined> {
    return Disposable.from(
      ...[
        App.tree.onDidChangeNodes(this.triggerChange, this),
        App.tree.onDidChangeSymbolNodes(this.triggerSymbolChange, this),
      ]
    )
  }

  async triggerSymbolSticked() {
    const { uri, range } = this.symbol.location

    const document = await workspace.openTextDocument(uri.path)
    fileSystem.edit(document.getText(range))
  }

  triggerSymbolChange() {
    void this.view.refresh()
  }
}
