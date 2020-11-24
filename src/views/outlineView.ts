import { commands, ConfigurationChangeEvent, } from 'vscode'
import { configuration } from '../config'

import { OutlineNode } from './nodes/outlineNode'
import { SymbolNode } from './nodes/symbolNode'
import { ViewBase } from './viewBase'

export class OutlineView extends ViewBase<OutlineNode> {
  private _path: string = ''
  get path() {
    return this._path
  }
  set path(val) {
    this.refresh(true)

    this._path = val
  }

  constructor() {
    super('facility.views.outline', 'Outline')
  }

  getRoot() {
    return new OutlineNode(this)
  }

  registerCommands() {
    // TODO: 程序级命令
    // void App.viewCommands();
    commands.registerCommand(
      this.getQualifiedCommand('stick'),
      (node: SymbolNode) => this.onSymbolSticked(node),
      this
    )
  }

  onConfigurationChanged(e: ConfigurationChangeEvent) {
    if (configuration.changed(e, 'views', 'repositories', 'location')) {
      this.initialize('facility', { showCollapseAll: true })
    }
    if (!configuration.initializing(e) && this._root !== undefined) {
      void this.refresh(true)
    }
  }

  async onSymbolSticked(symbolNode: SymbolNode) {
    return symbolNode.triggerSymbolSticked()
  }
}
