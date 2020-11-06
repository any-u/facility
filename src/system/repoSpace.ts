// import { fs } from "../services";
import fs from 'fs-extra'
import { TernarySearchTree } from './searchTree'

export class RepoSpace {
  private _foldersMap: any
  private _folders!: RepoSpaceFolder[]
  
  constructor(folders: RepoSpaceFolder[] = []) {
    this.folders = folders
  }

  get folders(): RepoSpaceFolder[] {
    return this._folders
  }

  set folders(folders: RepoSpaceFolder[]) {
    this._folders = folders
    this.updateFoldersMap()
  }

  private updateFoldersMap(): void {
    this._foldersMap = TernarySearchTree.forStrings();
    for (const folder of this.folders) {
      this._foldersMap.set((folder as any).uri, folder)
    }
  }
}

export class RepoSpaceFolder {

}


export function toRepospaceFolders() {
  
}