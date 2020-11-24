import {
  commands,
  SymbolInformation,
  Uri,
  Disposable,
  TreeItem,
  TreeItemCollapsibleState,
  workspace,
  SymbolKind,
} from 'vscode'
import { App } from '../../app'
import { configuration, fileSystem } from '../../services'

import { OutlineView } from '../outlineView'
import { SubscribeableViewNode } from './viewNode'

export class SymbolModel {
  parent?: SymbolModel
  symbol: SymbolInformation
  children: SymbolModel[]

  constructor(symbol?: SymbolInformation) {
    this.children = []
    this.symbol = symbol!
  }

  addChild(child: SymbolModel) {
    child.parent = this
    this.children.push(child)
  }
}

export async function getSymbolAfterTrimCache(path: string) {
  const tree = new SymbolModel()
  let symbols = (await commands.executeCommand<SymbolInformation[]>(
    'vscode.executeDocumentSymbolProvider',
    Uri.file(path)
  )) as any
  if (!symbols) return tree

  const symbolNodes = symbols
    .filter((symbol: any) => symbol.kind === SymbolKind.Function)
    .map((symbol: any) => new SymbolModel(symbol))
  let potentialParents: SymbolModel[] = []
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

export async function getSymbol(path: string) {
  // magic bug.
  // 获取真实路径文件symbol，需先获取其他路径文件的symbol
  // 否则会存在缓存
  // 附则bug, json文件(?)首次读不出来数据
  // TODO: 调研此问题
  await getSymbolAfterTrimCache(configuration.cacheHandleFile())
  return await getSymbolAfterTrimCache(path)
}

export class SymbolNode extends SubscribeableViewNode<OutlineView> {
  constructor(view: OutlineView, public readonly symbol: any) {
    super(view)
  }

  getChildren() {
    return []
  }

  getTreeItem() {
    const label = this.symbol.name
    const item = new TreeItem(label, TreeItemCollapsibleState.None)
    item.iconPath = {
      dark: App.context.asAbsolutePath(`images/dark/icon-function.svg`),
      light: App.context.asAbsolutePath(`images/light/icon-function.svg`),
    }
    item.command = {
      title: 'Stick Symbol',
      command: 'facility.views.outline.stick',
      arguments: [this],
    }

    return item
  }

  async triggerSymbolSticked() {
    const { uri, range } = this.symbol.location

    const document = await workspace.openTextDocument(uri.path)
    fileSystem.edit(document.getText(range))
  }

  refresh() {
    return
  }

  subscribe() {
    return Disposable.from()
  }
}
