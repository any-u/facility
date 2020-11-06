import { commands, Disposable, SymbolInformation, Uri } from 'vscode'
import { configuration } from '../config'
import { TernarySearchTree } from '../system/searchTree'
import { Gist } from './gist'

export class SymbolNode {
  parent?: SymbolNode
  symbol: SymbolInformation
  children: SymbolNode[]

  constructor(symbol?: SymbolInformation) {
    this.children = []
    this.symbol = symbol!
  }

  addChild(child: SymbolNode) {
    child.parent = this
    this.children.push(child)
  }
}

export class GistTree implements Disposable {
  private readonly _disposable: Disposable
  private readonly _gistTree: TernarySearchTree<Gist>

  // FIXME: path不能设为只读，path会被改文件名，导致outline无法实现同步更新
  constructor(public readonly name: string, public readonly path: string) {
    this._gistTree = TernarySearchTree.forPaths()

    this._disposable = Disposable.from()
  }
  dispose() {
    this._disposable && this._disposable.dispose()
  }

  private getSymbols(path: string): Thenable<SymbolInformation[]> {
    return commands.executeCommand<SymbolInformation[]>(
      'vscode.executeDocumentSymbolProvider',
      Uri.file(path)
    ) as any
  }

  private async updateSymbols(path: string): Promise<any> {
    const tree = new SymbolNode()
    let symbols = await this.getSymbols(path)
    if (!symbols) return tree

    const symbolNodes = symbols.map((symbol) => new SymbolNode(symbol))
    let potentialParents: SymbolNode[] = []
    symbolNodes.forEach((currentNode) => {
      // Drop candidates that do not contain the current symbol range
      potentialParents = potentialParents.filter(
        (node) =>
          node !== currentNode &&
          node.symbol.location.range.contains(
            currentNode.symbol.location.range
          ) &&
          !node.symbol.location.range.isEqual(currentNode.symbol.location.range)
      )
      if (!potentialParents.length) {
        tree.addChild(currentNode)
      } else {
        const parent = potentialParents[potentialParents.length - 1]
        parent.addChild(currentNode)
      }
      potentialParents.push(currentNode)
    })

    return tree
  }

  async analyze() {
    // FIX: VSCode read same path file will return cache information.
    // first load default file and then load truly information.
    await this.updateSymbols(configuration.defaultFile())
    const data = await this.updateSymbols(this.path)
    if (data.children) {
      this._gistTree.clear()
      for (let f of data.children) {
        let gist = new Gist(f.symbol.name, f)
        this._gistTree.set(f.symbol.name, gist)
      }
    }
    return Promise.resolve()
    // })
  }

  async getOrderedGists(): Promise<Gist[]> {
    const gist = [...(await this.getGists())]

    return gist
  }

  async getGists(): Promise<Iterable<Gist>> {
    const values = this._gistTree.values()

    return values
  }
}
