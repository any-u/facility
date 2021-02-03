import {
  TreeDataProvider,
  Disposable,
  Event,
  TreeItem,
  ConfigurationChangeEvent,
  EventEmitter,
  TreeView,
  window,
  TreeViewVisibilityChangeEvent,
} from 'vscode'
import { App } from '../app'
import { ViewNode } from './nodes/viewNode'
import { debounce } from 'lodash'
import { OutlineView } from './outlineView'
import { ExplorerView } from './explorerView'
import configuration from '../managers/configuration'

export type View = ExplorerView | OutlineView

export abstract class ViewBase<TRoot extends ViewNode<View>>
  implements TreeDataProvider<ViewNode>, Disposable {
  protected _onDidChangeTreeData = new EventEmitter<ViewNode>()
  get onDidChangeTreeData(): Event<ViewNode> {
    return this._onDidChangeTreeData.event
  }

  private _onDidChangeVisibility = new EventEmitter<TreeViewVisibilityChangeEvent>()
  get onDidChangeVisibility(): Event<TreeViewVisibilityChangeEvent> {
    return this._onDidChangeVisibility.event
  }

  protected _disposable: Disposable | undefined
  protected _root: TRoot | undefined
  protected _tree: TreeView<ViewNode> | undefined

  constructor(public readonly id: string, public readonly name: string) {
    this.registerCommands()

    App.context.subscriptions.push(
      configuration.onDidChange(this.onConfigurationChanged, this)
    )
    setImmediate(() =>
      this.onConfigurationChanged(configuration.initializingChangeEvent)
    )
  }

  dispose() {
    this._disposable && this._disposable.dispose()
  }

  getQualifiedCommand(command: string) {
    return `${this.id}.${command}`
  }

  protected abstract getRoot(): TRoot
  protected abstract registerCommands(): void
  protected abstract onConfigurationChanged(e: ConfigurationChangeEvent): void

  protected initialize(
    container?: string,
    options: { showCollapseAll?: boolean } = {}
  ) {
    if (this._disposable) {
      this._disposable.dispose()
      this._onDidChangeTreeData = new EventEmitter<ViewNode>()
    }

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

  protected ensureRoot() {
    if (this._root === undefined) {
      this._root = this.getRoot()
    }

    return this._root
  }

  getChildren(node?: ViewNode): ViewNode[] | Promise<ViewNode[]> {
    if (node !== undefined) return node.getChildren()

    const root = this.ensureRoot()
    return root.getChildren()
  }

  getTreeItem(node: ViewNode): TreeItem | Promise<TreeItem> {
    return node.getTreeItem()
  }

  protected onVisibilityChanged(e: TreeViewVisibilityChangeEvent) {
    this._onDidChangeVisibility.fire(e)
  }

  async refresh(reset: boolean = false) {
    if (this._root !== undefined && this._root.refresh !== undefined) {
      await this._root.refresh(reset)
    }

    this.triggerNodeChange()
  }

  async refreshNode(node: ViewNode) {
    this.triggerNodeChange(node)
  }

  triggerNodeChange(node?: ViewNode) {
    const data = node !== undefined && node !== this._root ? node : undefined
    this._onDidChangeTreeData.fire(data as any)
  }
}
