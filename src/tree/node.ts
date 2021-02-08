import { FileType } from 'vscode'
import Element from './element'

import Tree from './_explorerNode'

class TreeNode {
  #element: Element
  get element() {
    return this.#element
  }

  parentNode: TreeNode | null

  #path: string
  get path() {
    return this.#path
  }

  children: TreeNode[] = []

  constructor(public readonly tree: Tree, path: string) {
    this.#path = path

    this.#element = new Element(path)
  }

  getChild(path: string): TreeNode | undefined {
    const children = this.children.filter((item) => item.path === path)
    return children.length ? children[0] : undefined
  }
}

export default TreeNode
