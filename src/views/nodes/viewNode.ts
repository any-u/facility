import { Disposable, FileType, ThemeIcon, TreeItem } from 'vscode'
import { App } from '../../app'
import { FILENAME, FILE_EXTENSION } from '../../config/icon'
import { View } from '../viewBase'
import * as path from 'path'
import { appLibaryName } from '../../constants'

export enum ContextValues {
  Repositories = 'facility:repositories',
  Outline = 'facility:outline',
  Message = 'facility:message',
  Explorer = 'facility:explorer',
}

export interface ViewNode {
  readonly id?: string
}

export abstract class ViewNode<TView extends View = View> {
  constructor(
    public readonly view: TView,
    protected readonly parent?: ViewNode | null
  ) {}

  abstract getChildren(): ViewNode[] | Promise<ViewNode[]>

  abstract getTreeItem(): TreeItem | Promise<TreeItem>

  refresh?(reset?: boolean): void | boolean | Promise<void> | Promise<boolean>

  triggerChange(): any {
    return this.view.refreshNode(this)
  }

  adaptIcon(name: string, fileType: FileType) {
    const arr = name.split('.'),
      fileExtension = arr[arr.length - 1]

    if (fileType === FileType.Directory) {
      return name === appLibaryName
        ? {
            dark: App.context.asAbsolutePath(`images/dark/icon-repo.svg`),
            light: App.context.asAbsolutePath(`images/light/icon-repo.svg`),
          }
        : ThemeIcon.Folder
    }

    const checkFileExtension = (FILE_EXTENSION as any)[fileExtension]
    if (!checkFileExtension)
      return App.context.asAbsolutePath(
        path.join('images/icons', FILE_EXTENSION.DEFAULT)
      )

    return (FILENAME as any)[name]
      ? App.context.asAbsolutePath(
          path.join('images/icons', (FILENAME as any)[name])
        )
      : App.context.asAbsolutePath(
          path.join('images/icons', checkFileExtension)
        )
  }
}

export abstract class SubscribeableViewNode<
  TView extends View = View
> extends ViewNode<TView> {
  protected disposable: Disposable
  protected subscription: Promise<Disposable | undefined> | undefined

  private _loaded: boolean = false

  constructor(view: TView, protected readonly parent?: ViewNode | null) {
    super(view, parent)

    const disposables: any[] = [
      // this.view
    ]

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

    this.disposable = Disposable.from(...disposables)
  }

  async triggerChange() {
    if (!this._loaded) return

    await super.triggerChange()
  }

  private _canSubscribe: boolean = true
  protected get canSubscribe(): boolean {
    return this._canSubscribe
  }
  protected set canSubscribe(value: boolean) {
    if (this._canSubscribe === value) return

    this._canSubscribe = value

    void this.ensureSubscription()
    if (value) {
      void this.triggerChange()
    }
  }

  protected abstract subscribe():
    | Disposable
    | undefined
    | Promise<Disposable | undefined>

  protected async unsubscribe(): Promise<void> {
    if (this.subscription != null) {
      const subscriptionPromise = this.subscription
      this.subscription = undefined
      ;(await subscriptionPromise)?.dispose()
    }
  }

  async ensureSubscription() {
    // if(!this.canSubscribe ) {
    await this.unsubscribe()
    //   return
    // }

    if (this.subscription != null) return

    this.subscription = Promise.resolve(this.subscribe())
    await this.subscription
  }
}
