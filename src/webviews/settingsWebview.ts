import * as path from "path";
import { WebViewBase, IpcMessage } from "./webviewBase";
import { Container } from "../container";
import {  ipc } from "../services";

export class SettingsWebview extends WebViewBase {
  constructor() {
    super("facility.view.showSettings");
  }
  get dirpath() {
    return path.dirname(this.filepath);
  }

  get filepath() {
    return Container.context.asAbsolutePath("out/src/webviews/settings/index.html");
  }
  get id(): string {
    return "facility.settings";
  }

  get title(): string {
    return "Facility";
  }

  async onMessageReceived(e: IpcMessage) {
    const msg = await ipc.handler(e.cmd, e.data);
    msg.cbid = e.cbid;
    return this.postMessage(msg);
  }
}
