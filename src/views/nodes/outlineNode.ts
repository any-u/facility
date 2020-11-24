import { Disposable, TreeItem, TreeItemCollapsibleState } from 'vscode'
import { App } from '../../app'

import { OutlineView } from '../outlineView'
import { MessageNode } from './common'
import { getSymbol, SymbolNode } from './symbolNode'
import { ContextValues, SubscribeableViewNode } from './viewNode'

export class OutlineNode extends SubscribeableViewNode<OutlineView> {
  private _children: (SymbolNode | MessageNode)[] | undefined

  constructor(view: OutlineView) {
    super(view)
  }

  async getChildren(): Promise<(SymbolNode | MessageNode)[]> {
    if(!this.view.path) {
      return [new MessageNode(this.view, this, 'Cannot provide outline information.')]
    }
    const symbols = await getSymbol(this.view.path)

    if (symbols.children.length === 0) {
      return [new MessageNode(this.view, this, 'No Node could be found.')]
    }
    this._children = symbols.children.map(
      (item) => new SymbolNode(this.view, item.symbol)
    )

    return this._children
  }

  getTreeItem() {
    const item = new TreeItem('Outline', TreeItemCollapsibleState.Collapsed)
    item.contextValue = ContextValues.Outline
    return item
  }

  onSymbolChanged() {
    // 细节优化，节约性能
    void this.triggerChange()
  }

  refresh() {
    if (this._children === undefined) return

    this._children.forEach((item: any) => item.refresh())
  }

  subscribe() {
    const subscriptions: any[] = [
      App.explorerTree.onDidChangeNodes(this.onSymbolChanged, this),
    ]
    return Disposable.from(...subscriptions)
  }

  async onOutlineChanged() {
    // await this.view.tree.analyze()
    void this.triggerChange()
  }
}
