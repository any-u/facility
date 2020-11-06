interface PrevSelection {
  // TODO: 调整node类型
  node: any;
  time: number;
}

let prevselection: PrevSelection | null = null;

class Helper {
  // TODO: 调整node类型
  doubleClick(node: any) {
    const currentTime = Date.now(),
      doubleClickTime = 500;

    if (
      prevselection === null ||
      prevselection.node !== node ||
      currentTime - prevselection.time >= doubleClickTime
    ) {
      prevselection = { node: node, time: currentTime };
      return false;
    }

    prevselection = null;
    return true;
  }
}

export const helper = new Helper();
