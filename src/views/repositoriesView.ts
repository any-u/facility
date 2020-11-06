import { commands, ConfigurationChangeEvent } from 'vscode'
import { App } from '../app'
import { configuration } from '../config'
import { fs } from '../services'
import { helper } from '../services/helper'
import { RepositoriesNode } from './nodes'
import { GistNode } from './nodes/gistNode'
import { ViewBase } from './viewBase'

export class RepositoriesView extends ViewBase<RepositoriesNode> {
  constructor() {
    super('facility.views.repositories', 'Repositories')
  }

  getRoot() {
    return new RepositoriesNode(this, configuration.appFolder(), null)
  }

  registerCommands() {
    // TODO: 程序级命令
    // void App.viewCommands();

    commands.registerCommand(
      this.getQualifiedCommand('stick'),
      (node: GistNode) => this.onSticked(node),
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

  // get config(): ViewsConfig & RepositoriesViewConfig {
  // 	return { ...Container.config.views, ...Container.config.views.repositories };
  // }

  async onSticked(node: GistNode) {
    const { path } = node.repo
    const content = fs.getFileText(path)

    if (helper.doubleClick(node)) {
      node.triggerStick(content)
    } else {
      App.outlineView.registerTree(node.tree)
      await node.tree.analyze()
      App.outlineView.triggerNodeChange()
      App.outlineView.refresh()
    }
  }
}
