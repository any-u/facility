import { commands, Uri } from "vscode";
import { CONFIGURED_PATH } from "../config/pathConfig";
import { command, Command, Commands } from "./common";
@command()
export class Open extends Command {
    constructor() {
        super(Commands.Open)
    }
    async execute() {
        const uri = Uri.file(CONFIGURED_PATH)
        await commands.executeCommand(
            'vscode.openFolder',
            uri,
            true
        )
    }
}