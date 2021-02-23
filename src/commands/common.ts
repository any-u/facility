import { commands, Disposable, ExtensionContext } from "vscode"

export enum Commands {
  StickSnippet = "facility.views.explorer.stick",
  StickSymbol = "facility.views.outline.stick",
  Save = "facility.save",
  Paste = "facility.paste",
  Open = "facility.open",
  Pull = "facility.pull",
  Push = "facility.push",
}

export const enum CommandTitles {
  StickSnippet = "Stick Snippet",
  StickSymbol = 'Stick Symbol'
}

interface CommandConstructor {
  new (): Command
}

const registrableCommands: CommandConstructor[] = []

export function command(): ClassDecorator {
  return (target: any) => {
    registrableCommands.push(target)
  }
}

export function registerCommands(context: ExtensionContext): void {
  for (const c of registrableCommands) {
    context.subscriptions.push(new c())
  }
}

export abstract class Command implements Disposable {
  private readonly _disposable: Disposable

  constructor(command: Commands | Commands[]) {
    if (typeof command === "string") {
      this._disposable = commands.registerCommand(
        command,
        (...args: any[]) => this._execute(command, ...args),
        this
      )
      return
    }

    const subscriptions = command.map((cmd) =>
      commands.registerCommand(
        cmd,
        (...args: any[]) => this._execute(cmd, ...args),
        this
      )
    )
    this._disposable = Disposable.from(...subscriptions)
  }

  dispose() {
    this._disposable.dispose()
  }

  abstract execute(...args: any[]): any
  protected _execute(command: string, ...args: any[]): any {
    this.execute(args)
  }
}
