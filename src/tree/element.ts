import { FileType } from 'vscode'
import { basename, extname } from 'path'
import { stat } from '../utils'

class Element {
  #name: string
  get name() {
    return this.#name
  }

  #type: FileType
  get type() {
    return this.#type
  }

  #extension: string | undefined
  get extension() {
    return this.#extension
  }

  constructor(path: string) {
    this.#name = basename(path)
    this.#type = stat(path).isDirectory() ? FileType.Directory : FileType.File

    if (this.#type === FileType.File) {
      this.#extension = extname(path)
    }
  }
}

export default Element
