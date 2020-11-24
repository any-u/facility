import { FileType } from 'vscode'

/**
 *
 *
 * @export
 * @interface ITreeNode
 * @template T
 */
export interface ITreeNode<T> {
  readonly element: T
  readonly parent: ITreeNode<T> | null
  children: ITreeNode<T>[]
  readonly depth: number
  readonly visible: boolean
  // TODO: 增加索引，便于删除处理
}

export class TreeModel<T> {
  private nodes = new Map<T | null, ITreeNode<T>>()

  private _root: ITreeNode<T>
  get root() {
    return this._root
  }
  
  constructor(rootElement: T) {
    this._root = {
      parent: null,
      element: rootElement,
      children: [],
      depth: 0,
      visible: true,
    }
  }

  ensureRoot(element: T, children: ITreeNode<T>[], transformer: any) {
    if (!this._root.element || this._root.element === element) {
      this._root = {
        parent: null,
        element,
        children,
        depth: 0,
        visible: true,
      }
      this.nodes.set(element, this._root)
      return
    }
    if (transformer) this._root = transformer(this._root, element, children)
  }

  setChildren(element: T | null, children: ITreeNode<T>[], transform?: any) {
    if (!element) return
    this.ensureRoot(element, children, transform)

    for (let i = 0; i < children.length; i++) {
      this.nodes.set(element, children[i])
    }

  }

}
