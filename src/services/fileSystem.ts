import { Uri, FileType, window, TextEditorEdit, Position } from "vscode";
import * as path from "path";
import { file } from "../utils";
import { win } from "./index";

/*
 * NOTE:
 * windows will throw error `vscode unable to resolve filesystem provider with relative file path "C:/..."`
 * it's a magic bug, and can not find method to resolve
 * use file.listFile instead of fs.readDirectory
 */

class FileSystem {
  async getFileOrFolder(
    fullpath: string
  ): Promise<[string, FileType][] | (string | FileType)[][]> {
    // ensure folder path exist
    this.ensureFolderExist(fullpath);

    const files = file.listFile(fullpath);
    return files
      ? files.map((item: string) => {
          const stat = file.stat(fullpath + path.sep + item);
          return [item, stat.isDirectory() ? 2 : 1];
        })
      : [];
  }

  private ensureFolderExist(fullpath) {
    return file.mkdir(fullpath);
  }

  getFileText(fullpath: string): string {
    const text = file.data(fullpath);
    return text ? text : "";
  }

  async edit(data: string): Promise<void> {
    try {
      // FIXME:
      // Make editor be the active textEditor all the time.
      // because if oepn other file and close
      // will not make the editor be the active textEditor.
      const editor = window.activeTextEditor;

      if (!editor) {
        console.error("Failed to found Editor. Please open the Editor.");
        win.showWarningMessage("未找到编辑窗口，请打开窗口重试!");
        win.setStatusBarMessage("⚠未找到编辑窗口，请打开窗口重试!");
        return;
      }
      editor.edit((builder: TextEditorEdit) => {
        builder.insert(
          new Position(
            editor!.selection.end.line,
            editor!.selection.end.character
          ),
          data
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
  async openText(fullpath: string) {
    return await window.showTextDocument(Uri.file(fullpath));
  }

  async createAndInsertFile(fullpath: string, data: string) {
    this.ensureFolderExist(path.dirname(fullpath));
    return file.write(fullpath, data);
  }

  async renameFile(oldPath: string, newPath: string) {
    return file.mv(oldPath, newPath);
  }

  deleteFile(fullpath: string) {
    return file.remove(fullpath);
  }

  workspaceFolderMigrate(
    cfg: string,
    config: string,
    raw?: string | null | undefined
  ) {
    file.move(cfg, config);
    raw && file.remove(raw);
  }
}

export const fs = new FileSystem();
