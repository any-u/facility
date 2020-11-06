import fs from 'fs'
import * as mkdirp from 'mkdirp'

export interface IKeyIterator {
  reset(key: string): this
  next(): this

  hasNext(): boolean
  cmp(a: string): number
  value(): string
}

export class PathIterator implements IkeyIterator {
  private _value!: string
  private _from: number
  private _to!: number

  reset(key: string): this {
    // this._value = key
    return this.next()
  }

  hasNext() {
    return this._to < this._value.length
  }

  next(): this {
    return this
  }

  cmp() {}

  value() {}
}

export class FileTree<E> {
  static list<E>() {
    return new FileTree<E>(new PathIterator() as any)
  }

  static ensurePathExist(path: string) {
    if (fs.existsSync(path)) return
    mkdirp.sync(path)
  }

  private _iter: IKeyIterator
  private _root: FileTree<E> | undefined

  constructor(segments: IKeyIterator) {
    this._iter = segments
  }

  clear() {}

  set() {}

  get() {}

  delete() {}

  private *_iterator(node: any) {
    if (Node !== undefined) {
      // left
      yield* this._iterator(node.left)

      // node
      if (node.value) {
        yield [node.value, node.key]
      }

      // mid
      yield this._iterator(node.mid)

      // right
      yield* this._iterator(node.right)
    }
  }
}
