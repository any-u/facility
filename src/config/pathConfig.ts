import * as path from 'path'
import configuration from '../managers/configuration'

export const enum ConfigurationName {
  Id = 'id',
  Token = 'token',
  Keyword = 'keyword',
  WorkspaceFolder = 'workspaceFolder',
}

const join = (...p) => path.join(...p)

export const HIDDEN_FILENAME = '.fl'
export const ROOT = process.env.HOME || process.env.USERPROFILE || ''
export const ORIGIN_PATH = join(ROOT, HIDDEN_FILENAME)
export const CONFIGURED_PATH = join(
  configuration.get(ConfigurationName.WorkspaceFolder) || ROOT,
  HIDDEN_FILENAME
)
export const DEFAULT_FILE = join(
  configuration.get(ConfigurationName.WorkspaceFolder) || ROOT,
  HIDDEN_FILENAME,
  '.prohibit.js'
)

export const IGNORE_FILENAME = ['.DS_Store']
export const shouldFileIgnore = (p: string) =>
  IGNORE_FILENAME.some((name) => path.basename(p).includes(name))

// TODO Adapt windows prefix
export const PREFIX_REG = /(\/\w+)+\/.fl\/+/g
