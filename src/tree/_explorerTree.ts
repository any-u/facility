import { Disposable, Event, EventEmitter, FileType } from 'vscode'
import { basename } from 'path'
import monitor, { FWChangeType, MonitorChangeEvent } from '../managers/monitor'
import { HIDDEN_FILENAME } from '../config/pathConfig'
import { PREFIX_REG } from '../config/pathConfig'
import { join } from 'path'
import { bind } from 'lodash'
import { logger } from '../utils'
import Node from './node'

export class Tree implements Disposable {
  #disposable: Disposable
  #root: Node | undefined

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

  updateNodes({ type, path }: MonitorChangeEvent) {
    if (type === FWChangeType.ADDDIR) {
      if (basename(path) === HIDDEN_FILENAME) {
        this.#root = new Node(this, path)
      } else {
        const parentPath = path.slice(0, path.lastIndexOf('/'))
        const parent = this.getNode(parentPath)

        var node = new Node(this, path)
        this.insert(node, parent)
      }
    }

    if (type === FWChangeType.ADD) {
      const parentPath = path.slice(0, path.lastIndexOf('/'))
      const parent = this.getNode(parentPath)

      var node = new Node(this, path)
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

  getNode(path: string): Node | undefined {
    const match = path.match(PREFIX_REG)

    const prefix = match[0]
    const traces = path.replace(prefix, '').split('/')
    let node = this.#root
    while (traces.length) {
      let trace = join(prefix, traces.shift())
      const child = node.getChild(trace)

      // Child exists, Parent must exist
      if (!child) {
        logger.error(`[facility] invalid path: ${path}`)
        return
      }
      node = child
    }

    return node
  }

  insert(child: Node, parent: Node) {
    parent.children.push(child)
    child.parentNode = parent
  }

  remove(child: Node): void {
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
