import { Disposable, Event, EventEmitter, FileType } from 'vscode'
import { basename } from 'path'
import monitor, { FWChangeType, MonitorChangeEvent } from '../managers/monitor'
import { HIDDEN_FILENAME } from '../config/pathConfig'
import { PREFIX_REG } from '../config/pathConfig'
import { join } from 'path'
import TreeNode from './node'

class Tree implements Disposable {
  #disposable: Disposable
  #root: TreeNode | undefined

  #onDidChangeNodes = new EventEmitter<void>()
  get onDidChangeNodes(): Event<void> {
    return this.#onDidChangeNodes.event
  }

  constructor() {
    this.#disposable = Disposable.from(
      monitor.onWillChange(this.updateNodes, this)
    )
  }

  dispose() {
    this.#disposable.dispose()
  }

  getRoot() {
    return this.#root
  }

  updateNodes({ type, path }: MonitorChangeEvent) {
    if (type === FWChangeType.ADDDIR) {
      if (basename(path) === HIDDEN_FILENAME) {
        this.#root = new TreeNode(this, path)
      } else {
        const parentPath = path.slice(0, path.lastIndexOf('/'))
        const parent = this.getNode(parentPath)

        var node = new TreeNode(this, path)
        this.insert(node, parent)
      }
    }

    if (type === FWChangeType.ADD) {
      const parentPath = path.slice(0, path.lastIndexOf('/'))
      const parent = this.getNode(parentPath)

      var node = new TreeNode(this, path)
      this.insert(node, parent)
    }

    if (type === FWChangeType.CHANGE) {
      // content changes, no action required
    }

    if (type === FWChangeType.UNLINK) {
      const node = this.getNode(path)
      this.remove(node)
    }

    if (type === FWChangeType.UNLINKDIR) {
      const node = this.getNode(path)
      this.remove(node)
    }

    this.#onDidChangeNodes.fire()
  }

  getNode(path: string): TreeNode | undefined {
    const match = path.match(PREFIX_REG)
    if(match === null) return this.#root

    const prefix = match[0]
    const traces = path.replace(prefix, '').split('/')
    let node = this.#root
    while (traces.length > 0) {
      let trace = join(prefix, traces.shift())

      const child = node.getChild(trace)
      node = child
    }

    return node ? node : this.#root
  }

  insert(child: TreeNode, parent: TreeNode) {
    parent.children.push(child)
    child.parentNode = parent
  }

  remove(child: TreeNode): void {
    const parent = child.parentNode
    if (parent) {
      const i = parent.children.indexOf(child)
      if (i > -1) {
        parent.children.splice(i, 1)
      } else {
        console.error('target: ', child)
        console.error('parent: ', parent)
        throw Error('target is not a childNode of parent')
      }
      child.parentNode = null
    }
  }
}

export default Tree