import * as path from "path";
import { WebViewBase, IpcMessage } from "./webviewBase";
import { Container } from "../container";
import { helper } from "../services";

export class SettingsWebview extends WebViewBase {
  constructor() {
    super("facility.view.showSettings");
  }
  get dirpath() {
    return path.dirname(this.filepath);
  }

  get filepath() {
    return Container.context.asAbsolutePath("src/webviews/settings/index.html");
  }
  get id(): string {
    return "facility.settings";
  }

  get title(): string {
    return "轻便";
  }

  async onMessageReceived(e: IpcMessage) {
    const msg = await helper.handler(e.cmd, e.data);
    msg.cbid = e.cbid;
    return this.postMessage(msg);
  }
}
