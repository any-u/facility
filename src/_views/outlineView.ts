import { commands, ConfigurationChangeEvent } from "vscode"
import { ViewId, ViewName } from "../config"
import configuration from "../managers/configuration"
import { OutlineNode } from "./nodes/outlineNode"
import ViewBase from "./view"

export class OutlineView extends ViewBase<OutlineNode> {
  #path: string | undefined
  get path() {
    return this.#path
  }
  set path(val: string) {
    this.#path = val
    this.refresh()
  }

  constructor() {
    super(ViewId.Outline, ViewName.Outline)
  }

  getRoot() {
    return new OutlineNode(this)
  }

  registerCommands() {
    commands.registerCommand(
      this.getQualifiedCommand("stick"),
      (node: OutlineNode) => this.onSymbolSticked(node),
      this
    )
  }

  onConfigurationChanged(e: ConfigurationChangeEvent) {
    if (configuration.changed(e, "views", "repositories", "location")) {
      this.initialize("facility", { showCollapseAll: true })
    }
  }

  async onSymbolSticked(symbolNode: OutlineNode) {
    return symbolNode.triggerSymbolSticked()
  }

  refresh() {
    setTimeout(() => {
      super.refresh()
    }, 1000)
  }
}
