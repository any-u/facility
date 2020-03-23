import * as path from "path";
import { ViewNode, ResourceType } from "../viewNode";
import { TreeItem, TreeItemCollapsibleState, FileType } from "vscode";
import { Container } from "../../container";
import { SidebarView } from "../view";
import { win, fs, JSONIcons, Icons } from "../../services";

export class FileNode extends ViewNode {
  constructor(
    view: SidebarView,
    path: string,
    parent: ViewNode,
    public readonly file: [string, FileType]
  ) {
    super(view, path, parent);
  }

  getChildren() {
    return [];
  }

  async getTreeItem(): Promise<TreeItem> {
    const label = this.file[0] || "";

    const item = new TreeItem(label, TreeItemCollapsibleState.None);
    item.contextValue = ResourceType.File;
    item.iconPath = this.getImg(this.basename);
    item.command = {
      title: "Insert Template",
      command: "facility.view.insert",
      arguments: [this]
    };

    return item;
  }

  private getImg(basename: string) {
    const extname = path.extname(basename).substr(1);
    if (extname === "json") {
      const svg = JSONIcons[basename];
      return Container.context.asAbsolutePath(
        path.join("resources/icons", svg ? svg : "json.svg")
      );
    }

    const svg = Icons[extname];
    return Container.context.asAbsolutePath(
      path.join("resources/icons", svg ? svg : "default.svg")
    );
  }

  triggerInsert() {
    const data = fs.getFileText(this.path);
    data && fs.edit(data);

    this.onSuccessHandler("👏文件插入成功");
  }

  triggerEdit() {
    fs.openText(this.path);
  }

  async triggerRename() {
    const name = await win.showInputBox("请输入新文件名.");
    if (!name) return;
    await fs.renameFile(this.path, `${this.dirname}/${name}.${this.extname}`);
    this.view.triggerNodeChange();

    this.onSuccessHandler("👏文件重命名成功");
  }
}
