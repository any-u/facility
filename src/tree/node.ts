import { FileType } from 'vscode'
import Element from './element'

import { Tree } from './_explorerTree'

class Node {
  #element: Element
  get element() {
    return this.#element
  }

  #parent: Node | null
  get parent() {
    return this.#parent
  }

  #path: string
  get path() {
    return this.#path
  }

  #children: Node[] | undefined
  get children() {
    return this.#children
  }

  constructor(public readonly tree: Tree, path: string, fileType: FileType) {
    this.#path = path

    this.#element = new Element(path, fileType)
  }

  registerParent(path: string) {
    const lastIndex = path.lastIndexOf('/')

    const parentPath = path.slice(lastIndex)
    this.tree.notify(parentPath, this)
  }

  getChild(path: string): Node | undefined {
    const children = this.#children.filter((item) => item.path === path)
    return children.length ? children[0] : undefined
  }

  addChild(node: Node) {
    this.#children.push(node)
  }
}

export default Node
