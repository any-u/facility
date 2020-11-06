import { commands, ConfigurationChangeEvent, workspace } from 'vscode'
import { configuration } from '../config'
import { GistTree } from '../repo/gistTree'
import { FunctionNode } from './nodes/fuctionNode'
import { OutlineNode } from './nodes/outlineNode'
import { ViewBase } from './viewBase'

export class OutlineView extends ViewBase<OutlineNode> {
  public tree: GistTree
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
      (node: FunctionNode) => this.onSticked(node),
      this
    )
  }

  registerTree(tree: GistTree) {
    this.tree = tree
  }

  onConfigurationChanged(e: ConfigurationChangeEvent) {
    if (configuration.changed(e, 'views', 'repositories', 'location')) {
      this.initialize('facility', { showCollapseAll: true })
    }
    if (!configuration.initializing(e) && this._root !== undefined) {
      void this.refresh(true)
    }
  }

  async onSticked(gistNode: FunctionNode) {
    const { node } = gistNode.repo
    const { uri, range } = node.symbol.location

    const document = await workspace.openTextDocument(uri.path)
    gistNode.triggerStick(document.getText(range))
  }
}
