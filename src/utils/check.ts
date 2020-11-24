interface PrevSelection {
  node: any
  time: number
}

let prevselection: PrevSelection | null = null

export function isDblclick(node: any) {
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
