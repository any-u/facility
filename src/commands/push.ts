import { commands } from "vscode";
import { profiles } from "../services/profile";
import { command, Command, Commands } from "./common";


@command()
export class Push extends Command {
    constructor() {
        super(Commands.Push)
    }
    async execute() {
        try {
            const allProfiles = profiles.getAll()
            if (!allProfiles || allProfiles.length === 0) {
                commands.executeCommand(Commands.ProfileCreate)

                return;
            }
        } catch (error) {

        }
    }
}