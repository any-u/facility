import { ThemeIcon, TreeItem, TreeItemCollapsibleState, Uri } from 'vscode'
import { ContextValues, ViewNode } from './viewNode'
import { View } from '../viewBase'

export class MessageNode extends ViewNode {
  constructor(
    view: View,
    parent: ViewNode,
    private readonly _message: string,
    private readonly _description?: string,
    private readonly _tooltip?: string,
    private readonly _iconPath?:
      | string
      | Uri
      | {
          light: string | Uri
          dark: string | Uri
        }
      | ThemeIcon,
    private readonly _contextValue?: string
  ) {
    super(view, parent)
  }

  getChildren(): ViewNode[] | Promise<ViewNode[]> {
    return []
  }

  getTreeItem(): TreeItem | Promise<TreeItem> {
    const item = new TreeItem(this._message, TreeItemCollapsibleState.None)
    item.contextValue = this._contextValue ?? ContextValues.Message
    item.description = this._description
    item.tooltip = this._tooltip
    item.iconPath = this._iconPath
    return item
  }
}
