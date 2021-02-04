import * as path from 'path'
import * as _ from 'lodash'
import {
  workspace,
  ExtensionContext,
  EventEmitter,
  ConfigurationChangeEvent,
  Event,
  Uri,
  ConfigurationTarget,
} from 'vscode'
import { GIST_BAST_URL } from '../constants'
import { gists } from '../services/gist'
import { logger, showWarningMessage } from '../utils'
import { ConfigurationName, CONFIGURED_PATH } from '../config/pathConfig'
import { WarningMessage } from '../config/message'
import i18nManager from './i18n'

export interface Config {
  [ConfigurationName.Id]: string
  [ConfigurationName.Token]: string
  [ConfigurationName.Keyword]: object | null
  [ConfigurationName.WorkspaceFolder]: string | null
}

export const extensionId = 'facility'
export const extensionQualifiedId = `sillyy.${extensionId}`

export function ensureValidState() {
  const token = configuration.get(ConfigurationName.Token)

  if (token !== undefined && token !== '') {
    gists.configure({
      key: token,
      url: GIST_BAST_URL,
      rejectUnauthorized: true,
    })
    return true
  } else {
    logger.warn(i18nManager.format(WarningMessage.NoToken))

    showWarningMessage(i18nManager.format(WarningMessage.NoToken))
    return false
  }
}

export class Configuration {
  init(ctx: ExtensionContext) {
    // 配置项加上防抖，否则input输出会频繁触发
    ctx.subscriptions.push(
      workspace.onDidChangeConfiguration(
        _.debounce(configuration.onConfigurationChanged, 250),
        configuration
      )
    )
  }

  private _onDidChange = new EventEmitter<ConfigurationChangeEvent>()
  get onDidChange(): Event<ConfigurationChangeEvent> {
    return this._onDidChange.event
  }

  private onConfigurationChanged(e: ConfigurationChangeEvent) {
    this._onDidChange.fire(e)
  }

  readonly initializingChangeEvent: ConfigurationChangeEvent = {
    affectsConfiguration: () => true,
  }

  initializing(e: ConfigurationChangeEvent) {
    return e === this.initializingChangeEvent
  }

  get(): Config
  get<S1 extends keyof Config>(
    s1: S1,
    resource?: Uri | null,
    defaultValue?: Config[S1]
  ): Config[S1]
  get<S1 extends keyof Config, S2 extends keyof Config[S1]>(
    s1: S1,
    s2: S2,
    resource?: Uri | null,
    defaultValue?: Config[S1][S2]
  ): Config[S1][S2]
  get<
    S1 extends keyof Config,
    S2 extends keyof Config[S1],
    S3 extends keyof Config[S1][S2]
  >(
    s1: S1,
    s2: S2,
    s3: S3,
    resource?: Uri | null,
    defaultValue?: Config[S1][S2][S3]
  ): Config[S1][S2][S3]
  get<
    S1 extends keyof Config,
    S2 extends keyof Config[S1],
    S3 extends keyof Config[S1][S2],
    S4 extends keyof Config[S1][S2][S3]
  >(
    s1: S1,
    s2: S2,
    s3: S3,
    s4: S4,
    resource?: Uri | null,
    defaultValue?: Config[S1][S2][S3][S4]
  ): Config[S1][S2][S3][S4]
  get<T>(...args: any[]): T {
    let section: string | undefined
    let resource: Uri | null | undefined
    let defaultValue: T | undefined
    if (args.length > 0) {
      section = args[0]
      if (typeof args[1] === 'string') {
        section += `.${args[1]}`
        if (typeof args[2] === 'string') {
          section += `.${args[2]}`
          if (typeof args[3] === 'string') {
            section += `.${args[3]}`
            resource = args[4]
            defaultValue = args[5]
          } else {
            resource = args[3]
            defaultValue = args[4]
          }
        } else {
          resource = args[2]
          defaultValue = args[3]
        }
      } else {
        resource = args[1]
        defaultValue = args[2]
      }
    }

    return defaultValue === undefined
      ? workspace
          .getConfiguration(
            section === undefined ? undefined : extensionId,
            resource
          )
          .get<T>(section === undefined ? extensionId : section)!
      : workspace
          .getConfiguration(
            section === undefined ? undefined : extensionId,
            resource
          )
          .get<T>(section === undefined ? extensionId : section, defaultValue)!
  }

  name(...args: string[]) {
    return args.join('.')
  }

  update<S1 extends keyof Config>(
    s1: S1,
    value: Config[S1] | undefined,
    target: ConfigurationTarget
  ): Thenable<void>
  update<S1 extends keyof Config, S2 extends keyof Config[S1]>(
    s1: S1,
    s2: S2,
    value: Config[S1][S2] | undefined,
    target: ConfigurationTarget
  ): Thenable<void>

  update<
    S1 extends keyof Config,
    S2 extends keyof Config[S1],
    S3 extends keyof Config[S1][S2]
  >(
    s1: S1,
    s2: S2,
    s3: S3,
    value: Config[S1][S2][S3] | undefined,
    target: ConfigurationTarget
  ): Thenable<void>
  update<
    S1 extends keyof Config,
    S2 extends keyof Config[S1],
    S3 extends keyof Config[S1][S2],
    S4 extends keyof Config[S1][S2][S3]
  >(
    s1: S1,
    s2: S2,
    s3: S3,
    s4: S4,
    value: Config[S1][S2][S3][S4] | undefined,
    target: ConfigurationTarget
  ): Thenable<void>
  update(...args: any[]) {
    let section: string = args[0]
    let value
    let target: ConfigurationTarget
    if (typeof args[1] === 'string' && args.length > 3) {
      section += `.${args[1]}`
      if (typeof args[2] === 'string' && args.length > 4) {
        section += `.${args[2]}`
        if (typeof args[3] === 'string' && args.length > 5) {
          section += `.${args[3]}`
          value = args[4]
          target = args[5]
        } else {
          value = args[3]
          target = args[4]
        }
      } else {
        value = args[2]
        target = args[3]
      }
    } else {
      value = args[1]
      target = args[2]
    }

    return workspace
      .getConfiguration(extensionId)
      .update(section, value, target)
  }

  changed(e: ConfigurationChangeEvent, ...args: any[]) {
    let section: string = args[0]
    let resource: Uri | null | undefined
    if (typeof args[1] === 'string') {
      section += `.${args[1]}`
      if (typeof args[2] === 'string') {
        section += `.${args[2]}`
        if (typeof args[3] === 'string') {
          section += args[3]
          resource = args[4]
        } else {
          resource = args[3]
        }
      } else {
        resource = args[2]
      }
    } else {
      resource = args[1]
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return e.affectsConfiguration(`facility.${section}`, resource!)
  }
}

const configuration = new Configuration()
export default configuration

export const resolve = (path: string) => CONFIGURED_PATH + path
export const dropRoot = (path: string) => path.replace(CONFIGURED_PATH, '')
