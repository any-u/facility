import { window, commands, MessageItem } from "vscode";
import { profiles } from "../services/profile";
import { showErrorMessage, showInputBox } from "../utils";
import { command, Command, Commands } from "./common";

@command()
export class ProfileCreate extends Command {
    constructor() {
        super(Commands.ProfileCreate)
    }
    async execute() {
        try {
            const { title } = (await window.showInformationMessage(
                'Which GitHub Platform?',
                { modal: true },
                { title: 'GitHub.com (common)', isCloseAffordance: true },
                { title: 'GitHub Enterprise' }
            )) as MessageItem;

            const url =
                title === 'GitHub Enterprise'
                    ? await showInputBox({
                        prompt: 'Enter your enterprise API url'
                    })
                    : 'https://api.github.com';

            if (!url) {
                showErrorMessage('User Aborted Create Profile at "url"');

                return;
            }

            const key = await showInputBox({
                prompt: 'Enter your access token'
            });

            if (!key) {
                showErrorMessage('User Aborted Create Profile at "key"');

                return;
            }

            const name = await showInputBox({
                prompt: 'Give this profile a name'
            });

            if (!name) {
                showErrorMessage('User Aborted Create Profile at "name"');

                return;
            }
            profiles.add(name, key, url, true);
            
        } catch (err) {
            console.log(err)
        }
    }
}