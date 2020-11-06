import { Disposable, TreeItem, TreeItemCollapsibleState } from 'vscode'
import { App } from '../../app'

import { OutlineView } from '../outlineView'
import { ModuleNode } from './moduleNode'
import { ContextValues, SubscribeableViewNode } from './viewNode'

export class OutlineNode extends SubscribeableViewNode<OutlineView> {
  private _children: ModuleNode[] | undefined

  constructor(view: OutlineView) {
    super(view, '')
  }

  async getChildren() {
    this._children =   [new ModuleNode(this.view, '')]
    return this._children
  }

  getTreeItem() {
    const item = new TreeItem('Outline', TreeItemCollapsibleState.Collapsed)
    item.contextValue = ContextValues.Outline
    return item
  }

  refresh() {
    if (this._children === undefined) return

    this._children.forEach((item) => item.refresh())
  }

  subscribe() {
    const subscriptions = [
      App.tree.onDidChangeOutline(this.onOutlineChanged, this),
    ]
    return Disposable.from(...subscriptions)
  }

  async onOutlineChanged() {
    await this.view.tree.analyze()
    void this.triggerChange()
  }
}
