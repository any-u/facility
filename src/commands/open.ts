import { commands, Uri } from "vscode";
import { configuration } from "../config";
import { command, Command, Commands } from "./common";
@command()
export class Open extends Command {
    constructor() {
        super(Commands.Open)
    }
    async execute() {
        const uri = Uri.file(configuration.appFolder)
        await commands.executeCommand(
            'vscode.openFolder',
            uri,
            true
        )
    }
}