import { commands, ConfigurationChangeEvent, workspace } from 'vscode'
import { configuration } from '../config'
import { ExplorerNode } from './nodes/explorerNode'
import { RepositoryNode } from './nodes/repositoryNode'
import { ViewBase } from './viewBase'

export class ExplorerView extends ViewBase<any> {
  constructor() {
    super('facility.views.explorer', 'Explorer')
  }

  getRoot() {
    return new ExplorerNode(this, true)
  }

  registerCommands() {
    commands.registerCommand(
      this.getQualifiedCommand('stick'),
      (node: RepositoryNode) => this.onGistSticked(node),
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

  async onGistSticked(node: RepositoryNode) {
    return node.triggerGistSticked()
  }
}
