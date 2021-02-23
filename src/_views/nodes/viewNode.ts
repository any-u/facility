import { Disposable, TreeItem } from "vscode"
import App from "../../app"
import { View } from "../view"

export abstract class ViewNode<TView extends View = View> {
  protected subscription: Promise<Disposable | undefined> | undefined

  private _loaded = false

  constructor(
    public readonly view: TView,
    protected readonly parent?: ViewNode | null
  ) {
    const getTreeItem = this.getTreeItem
    this.getTreeItem = function (this: ViewNode<TView>) {
      this._loaded = true
      void this.ensureSubscription()
      return getTreeItem.apply(this)
    }

    const getChildren = this.getChildren
    this.getChildren = function (this: ViewNode<TView>) {
      this._loaded = true
      void this.ensureSubscription()
      return getChildren.apply(this)
    }
  }

  abstract getChildren(): ViewNode[] | Promise<ViewNode[]>

  abstract getTreeItem(): TreeItem | Promise<TreeItem>

  protected subscribe():
    | Disposable
    | undefined
    | Promise<Disposable | undefined> {
    return Disposable.from(App.tree.onDidChangeNodes(this.triggerChange, this))
  }

  protected async unsubscribe(): Promise<void> {
    if (this.subscription !== undefined) {
      const subscriptionPromise = this.subscription

      this.subscription = undefined
      ;(await subscriptionPromise)?.dispose
    }
  }

  async ensureSubscription() {
    await this.unsubscribe()

    if (this.subscription !== undefined) return

    this.subscription = Promise.resolve(this.subscribe())

    await this.subscription
  }

  triggerChange() {
    void this.view.refresh()
  }
}
