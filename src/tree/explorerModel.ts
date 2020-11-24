import { ITreeNode, TreeModel } from './treeModel'

export interface IExplorerTreeNode<T> extends ITreeNode<T> {
  readonly parent: IExplorerTreeNode<T> | null
  children: IExplorerTreeNode<T>[]
}

export class ExplorerModel<T> extends TreeModel<T> {
  constructor(rootElement: T) {
    super(rootElement)
  }

}
