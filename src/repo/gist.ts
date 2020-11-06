import { Disposable } from "vscode";
import { SymbolNode } from "./gistTree";

export class Gist implements Disposable {

  constructor(
    public readonly name,
    public readonly node: SymbolNode,
  ) {

  }
  
  dispose() {

  }
}