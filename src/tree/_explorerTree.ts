import { Disposable, Event, EventEmitter, FileType } from 'vscode'
import { basename } from 'path'
import monitor, { FWChangeType, MonitorChangeEvent } from '../managers/monitor'
import { HIDDEN_FILENAME } from '../config/pathConfig'
import Node from './node'
import { PREFIX_REG } from '../config/pathConfig'
import { join } from 'path'

export class Tree implements Disposable {
  #disposable: Disposable
  #root: Node | null

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

  notify(path: string, node: Node) {
    const parent = this.get(path)
    parent.addChild(node)
  }

  get(path: string) {
    const match = path.match(PREFIX_REG)
    if (!match) {
      console.log(`[facility] invalid path: ${path}`)
      return
    }

    const prefix = match[0]
    const traces = path.replace(prefix, '').split('/')

    let node = this.#root
    while (traces.length) {
      let trace = join(prefix, traces.shift())
      node = node.getChild(trace)
    }

    return node
  }

  updateNodes({ type, path }: MonitorChangeEvent) {
    if (type === FWChangeType.ADDDIR) {
      if (basename(path) === HIDDEN_FILENAME) {
        // this.#root =
      }
    }

    if (type === FWChangeType.ADD) {
    }
  }

  insertNode() {}
}
