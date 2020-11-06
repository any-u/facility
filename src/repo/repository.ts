import { Disposable } from 'vscode'
import { App } from '../app'
import * as path from 'path'

export class Repository implements Disposable {
  readonly formattedName: string

  private _parent: Repository | undefined
  get parent() {
    return this._parent
  }

  constructor(
    public readonly name,
    public readonly path,
    public readonly root: boolean,
    public readonly type
  ) {
    this.formattedName = name

    !root && this.pourParent()
  }
  dispose() {}

  pourParent() {
    this._parent = App.tree.getNode(path.dirname(this.path))
  }
}
