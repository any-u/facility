import {
  Disposable,
  FileChangeType,
  Event,
  EventEmitter,
  FileType,
} from 'vscode'
import { BaseElement, Tree } from './tree'
import { IFoldersChangeEvent, watcher } from '../reactive/watcher'
import { ExplorerModel } from './explorerModel'
import { IExplorerTreeNode } from './explorerModel'
import { fileSystem } from '../services'
import { App } from '../app'

export interface IGist {
  path: string
  fileType: FileType
  // TODO No FileChangeType required
  type: FileChangeType
}

export type TExplorerTreeNode = IExplorerTreeNode<GistElement>

export class GistElement extends BaseElement<ExplorerTree<GistElement>> {
  private _element: IGist
  get element() {
    return this._element
  }

  constructor(tree: ExplorerTree<GistElement>, name: string, element: IGist) {
    super(tree, name)

    this._element = element
  }
}

export class ExplorerTree<T> extends Tree<T> {
  private _onDidChangeNodes = new EventEmitter<void>()
  get onDidChangeNodes(): Event<void> {
    return this._onDidChangeNodes.event
  }

  public readonly nodes = new Map<string | undefined, IExplorerTreeNode<T>>()
  // public readonly root: IExplorerTreeNode<T> | undefined

  constructor() {
    super()

    this._disposable = Disposable.from(
      watcher.onWillChange(this.updateNode, this)
    )
  }

  createModel() {
    return new ExplorerModel(null)
  }

  clear() {
    this.model = this.createModel()
    this.nodes.clear()
  }

  deleteNode(key: string, fileType: FileType) {
    const node = this.getNode(key, fileType)
    if (node) {
      ;(node.parent?.children as IExplorerTreeNode<T>[]).forEach((item, i) => {
        if ((item.element as any).name === key) {
          node.parent?.children.splice(i, 1)
        }
      })
    }
    this.nodes.delete(key)
  }

  getRoot() {
    return this.model.root
  }

  getNode(p: string, fileType: FileType) {
    const element = new GistElement(this as any, p, {
      path: p,
      fileType,
      type: FileChangeType.Created,
    })

    // TODO: fix anyscript
    const value = this.nodes.get((element as any).name)

    return value
  }

  getFilterNodes(handler: (...args: any) => any) {
    return Array.from(this.nodes.values()).map(handler).filter(item => item)
  }
  private async updateNode(e: IFoldersChangeEvent) {
    const { path, fileType, type } = e

    if (type === FileChangeType.Created) {
      // TODO: fix anyscript
      const node = new GistElement(this as any, path, e)
      // TODO: optimize the process
      this.model.setChildren(node as any, [], this.transform.bind(this))
    }

    if (type === FileChangeType.Deleted) {
      // TODO: optimize the process
      this.deleteNode(path, fileType)
    }

    if (type === FileChangeType.Changed) {
      if (App.outlineView.path === '') return
    }

    this._onDidChangeNodes.fire()
  }

  patchNode(n1: TExplorerTreeNode, n2: TExplorerTreeNode) {
    const patchRootNode = (n1: TExplorerTreeNode, n2: TExplorerTreeNode) => {
      let {
        element: { name },
      } = n2
      if (name !== n1.element.name) {
        const p1 = n1.element.name.split('/').filter((item) => item !== '')
        const p2 = name.split('/').filter((item) => item !== '')

        let basePath = '/'
        let temp = true,
          i = 0
        while (temp) {
          if (p1[i] === p2[i]) {
            basePath += `${p1[i]}/`
            p1.shift()
            p2.shift()
          } else {
            temp = false
          }
        }

        const deepCreateNode = (
          path: string,
          fileType: FileType,
          parent: TExplorerTreeNode | null
        ): TExplorerTreeNode => {
          const element = new GistElement(this as any, path, {
            path: path,
            fileType: fileSystem.isDirectory(path)
              ? FileType.Directory
              : FileType.File,
            type: FileChangeType.Created,
          })
          const children = this.nodes.get(path)?.children
          // TODO: fix anyscript
          return creatNode(
            element,
            parent,
            children ? (children as any) : [],
            parent ? parent.depth + 1 : 0
          )
        }

        const isExist = (
          children: TExplorerTreeNode[],
          node: TExplorerTreeNode
        ) => {
          for (const value of children) {
            if (value.element.name === node.element.name) {
              return false
            }
          }
          return true
        }

        const el = deepCreateNode(basePath, FileType.Directory, null)
        let cur: TExplorerTreeNode = el
        let baseP1 = basePath
        while (p1.length) {
          const fileType = p1.length === 1 ? FileType.File : FileType.Directory
          const node = deepCreateNode(baseP1 + p1[0], fileType, cur)
          isExist(cur.children, node) && cur.children.push(node)
          cur = node
          if (baseP1[baseP1.length - 1] === '/') {
            baseP1 += p1.shift()
          } else {
            baseP1 += `/${p1.shift()}`
          }
        }

        cur = el
        let baseP2 = basePath
        while (p2.length) {
          const fileType = p2.length === 1 ? FileType.File : FileType.Directory
          if (baseP2[baseP2.length - 1] === '/') {
            baseP2 += p2.shift()
          } else {
            baseP2 += `/${p2.shift()}`
          }
          const node = deepCreateNode(baseP2, fileType, cur)
          isExist(cur.children, node) && cur.children.push(node)
          cur = node
        }

        return el
      }
      return n2
    }

    const creatNode = (
      element: GistElement,
      parent: TExplorerTreeNode | null,
      children: TExplorerTreeNode[],
      depth: number,
      visible: boolean = true
    ) => {
      const node = { element, parent, children, depth, visible }
      // TODO: fix anyscript
      !this.nodes.get(element.name) && this.nodes.set(element.name, node as any)
      return node
    }

    if (n1.depth === 0) return patchRootNode(n1, n2)

    return n2
  }

  transform(
    root: TExplorerTreeNode,
    element: GistElement,
    children: TExplorerTreeNode[]
  ) {
    const rootElemet = root.element
    if (rootElemet.name === element.name) return

    return this.patchNode(root, {
      parent: null,
      element: element,
      children: [],
      depth: 0,
      visible: true,
    })!
  }
}
