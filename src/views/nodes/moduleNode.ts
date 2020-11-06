import { Disposable, TreeItem, TreeItemCollapsibleState } from 'vscode'
import { App } from '../../app'

import { OutlineView } from '../outlineView'
import { MessageNode } from './common'
import { FunctionNode } from './fuctionNode'
import { SubscribeableViewNode } from './viewNode'

export class ModuleNode extends SubscribeableViewNode<OutlineView> {
  private _children: FunctionNode[] | undefined
  constructor(view: OutlineView, public readonly repo: any) {
    super(view, '')
  }

  private get name() {
    return this.view.tree.name || 'Repository'
  }

  async getChildren() {
    const modules = await this.view.tree?.getOrderedGists()
    if (!modules)
      return [new MessageNode(this.view, this, 'No outline could be found.')]

    const children = modules?.map((item) => new FunctionNode(this.view, item))

    this._children = children
    return this._children
  }

  getTreeItem() {
    const item = new TreeItem(this.name, TreeItemCollapsibleState.Expanded)
    item.iconPath = {
      dark: App.context.asAbsolutePath(`images/dark/icon-class.svg`),
      light: App.context.asAbsolutePath(`images/light/icon-class.svg`),
    }

    return item
  }

  async refresh() {
    // this.view.tree && await this.view.tree.analyze()
    const modules = await this.view.tree.getOrderedGists()
    this._children = modules.map((item) => new FunctionNode(this.view, item))


    void this.ensureSubscription()
  }

  subscribe() {
    return Disposable.from()
  }
}
