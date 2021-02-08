import {
  ConfigurationChangeEvent,
  Disposable,
  Event,
  EventEmitter,
  TreeDataProvider,
  TreeView,
  TreeViewVisibilityChangeEvent,
  window,
} from 'vscode'
import { ViewNode } from './nodes/viewNode'
import { extensionId, ViewId, ViewName } from '../config'
import { debounce } from 'lodash'
import configuration from '../managers/configuration'

export type View = any

abstract class ViewBase<TRoot extends ViewNode<View>>
  implements TreeDataProvider<ViewNode>, Disposable {
  // protected _onDidChangeTreeData = new EventEmitter<ViewNode>()
  // get onDidChangeTreeData(): EventEmitter<ViewNode>{
  //   return this._onDidChangeTreeData.event
  // }

  private _onDidChangeVisibility = new EventEmitter<TreeViewVisibilityChangeEvent>()
  get onDidChangeVisibility(): Event<TreeViewVisibilityChangeEvent> {
    return this._onDidChangeVisibility.event
  }

  protected _disposable: Disposable | undefined
  protected _root: TRoot | undefined
  protected _tree: TreeView<ViewNode> | undefined

  constructor(public readonly id: ViewId, public readonly name: ViewName) {
    this.registerCommands()

    setImmediate(() =>
      this.onConfigurationChanged(configuration.initializingChangeEvent)
    )
  }

  protected abstract getRoot(): TRoot
  protected abstract registerCommands(): void
  protected abstract onConfigurationChanged(e: ConfigurationChangeEvent): void

  dispose() {
    this._disposable && this._disposable.dispose()
  }

  protected initialize(
    container = extensionId,
    options: { showCollapseAll?: boolean } = {}
  ) {
    this._tree = window.createTreeView(
      `${this.id}${container ? `:${container}` : ''}`,
      {
        ...options,
        treeDataProvider: this,
      }
    )

    this._disposable = Disposable.from(
      this._tree,
      this._tree.onDidChangeVisibility(
        debounce(this.onVisibilityChanged, 250),
        this
      )
    )
  }

  getTreeItem(node: ViewNode) {
    return node.getTreeItem()
  }

  getChildren(node?: ViewNode): ViewNode[] | Promise<ViewNode[]> {
    if (node !== undefined) return node.getChildren()

    const root = this.ensureRoot()

    return root.getChildren()
  }

  protected ensureRoot() {
    if (this._root === undefined) {
      this._root = this.getRoot()
    }

    return this._root
  }

  protected onVisibilityChanged(e: TreeViewVisibilityChangeEvent) {
    this._onDidChangeVisibility.fire(e)
  }
}

export default ViewBase
