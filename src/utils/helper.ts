import { GistNode } from '../views/nodes/gistNode'

interface PrevSelection {
  node: GistNode
  time: number
}

let prevselection: PrevSelection | null = null

class Helper {
  doubleClick(node: GistNode) {
    const currentTime = Date.now(),
      doubleClickTime = 500

    if (
      prevselection === null ||
      prevselection.node !== node ||
      currentTime - prevselection.time >= doubleClickTime
    ) {
      prevselection = { node: node, time: currentTime }
      return false
    }

    prevselection = null
    return true
  }
}

export const helper = new Helper()
