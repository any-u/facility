import { TreeItem } from 'vscode';
import { View } from '../view'

export abstract class ViewNode<V = View> {
  constructor(
    public readonly view: V,
    protected readonly parent?: ViewNode | null
  ) {
    
  }

  abstract getChildren(): ViewNode[] | Promise<ViewNode[]>

  abstract getTreeItem(): TreeItem | Promise<TreeItem>
}
