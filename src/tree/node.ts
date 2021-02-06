import { FileType } from 'vscode'
import Element from './element'

import { Tree } from './_explorerTree'

class Node {
  #element: Element
  get element() {
    return this.#element
  }

  parentNode: Node | null

  #path: string
  get path() {
    return this.#path
  }

  children: Node[] | undefined

  constructor(public readonly tree: Tree, path: string) {
    this.#path = path

    this.#element = new Element(path)
  }

  getChild(path: string): Node | undefined {
    const children = this.children.filter((item) => item.path === path)
    return children.length ? children[0] : undefined
  }

}

export default Node
