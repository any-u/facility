import { Disposable } from 'vscode'
import { TreeModel, ITreeNode } from './treeModel'

export interface ITreeElement<T> {
  readonly element: T
  readonly children: Iterable<ITreeElement<T>>
}

export class BaseElement<T> {
  constructor(
    public readonly tree: T,
    public name: string,
  ) {}
}


export abstract class Tree<T> implements Disposable {
  _disposable: Disposable

  protected model: TreeModel<T | null>

  constructor() {
    this.model = this.createModel()

    this._disposable = Disposable.from()
  }

  setChildren(element: T | null, children: ITreeNode<T>[]) {
    this.model.setChildren(element, children)
  }

  createModel() {
    return new TreeModel(null)
  }

  dispose() {
    this._disposable.dispose()
  }
}

