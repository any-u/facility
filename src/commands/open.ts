import { commands, Uri } from "vscode";
import configuration from "../managers/configuration";
import { command, Command, Commands } from "./common";
@command()
export class Open extends Command {
    constructor() {
        super(Commands.Open)
    }
    async execute() {
        const uri = Uri.file(configuration.path)
        await commands.executeCommand(
            'vscode.openFolder',
            uri,
            true
        )
    }
}