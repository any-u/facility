import { FileType } from 'vscode'
import { basename, extname } from 'path'

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

  constructor(path: string, fileType: FileType) {
    this.#name = basename(path)
    this.#type = fileType

    if (fileType === FileType.File) {
      this.#extension = extname(path)
    }
  }
}

export default Element