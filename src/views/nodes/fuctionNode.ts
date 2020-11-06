import { Disposable, TreeItem, TreeItemCollapsibleState } from 'vscode'
import { App } from '../../app'
import { fs } from '../../services'

import { OutlineView } from '../outlineView'
import { SubscribeableViewNode } from './viewNode'

export class FunctionNode extends SubscribeableViewNode<OutlineView> {
  constructor(view: OutlineView, public readonly repo: any) {
    super(view, '')
  }

  getChildren() {
    return []
  }

  getTreeItem() {
    const label = this.repo.name
    const item = new TreeItem(label, TreeItemCollapsibleState.None)
    item.iconPath = {
      dark: App.context.asAbsolutePath(`images/dark/icon-function.svg`),
      light: App.context.asAbsolutePath(`images/light/icon-function.svg`),
    }
    item.command = {
      title: 'Stick Gist',
      command: 'facility.views.outline.stick',
      arguments: [this],
    }

    return item
  }
  
  triggerStick(details: string) {
    fs.edit(details)
  }

  subscribe() {
    return Disposable.from()
  }
}
