import { commands, Uri } from "vscode";
import { configuration } from "../config";
import { command, Command, Commands } from "./common";
@command()
export class Pull extends Command {
    constructor() {
        super(Commands.Pull)
    }
    async execute() {
      console.log('pull')
    }
    
}