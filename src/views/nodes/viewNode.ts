import { Disposable, TreeItem } from "vscode"
import { View } from "../view"

export abstract class ViewNode<TView extends View = View> {
  constructor(
    public readonly view: TView,
    protected readonly parent?: ViewNode | null
  ) {}

  abstract getChildren(): ViewNode[] | Promise<ViewNode[]>

  abstract getTreeItem(): TreeItem | Promise<TreeItem>

  refresh?(reset?: boolean): void | boolean | Promise<void> | Promise<boolean>

  triggerChange() {
    void this.view.refresh()
  }
}

export abstract class SubscribeableViewNode<
  TView extends View = View
> extends ViewNode<TView> {
  protected subscription: Promise<Disposable | undefined> | undefined

  private _loaded = false

  constructor(
    public readonly view: TView,
    protected readonly parent?: ViewNode | null
  ) {
    super(view, parent)

    const getTreeItem = this.getTreeItem
    this.getTreeItem = function (this: SubscribeableViewNode<TView>) {
      this._loaded = true
      void this.ensureSubscription()
      return getTreeItem.apply(this)
    }

    const getChildren = this.getChildren
    this.getChildren = function (this: SubscribeableViewNode<TView>) {
      this._loaded = true
      void this.ensureSubscription()
      return getChildren.apply(this)
    }
  }

  protected abstract subscribe():
    | Disposable
    | undefined
    | Promise<Disposable | undefined>

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

  async triggerChange() {
    if (!this._loaded) return

    await super.triggerChange()
  }
}
