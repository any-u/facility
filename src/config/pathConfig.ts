import * as path from 'path'
import configuration from '../managers/configuration'

export const enum ConfigurationName {
  Id = 'id',
  Token = 'token',
  Keyword = 'keyword',
  WorkspaceFolder = 'workspaceFolder',
}

const join = (...p) => path.join(...p)

export const HIDDEN = '.fl'
export const ROOT = process.env.HOME || process.env.USERPROFILE || ''
export const ORIGIN_PATH = join(ROOT, HIDDEN)
export const CONFIGURED_PATH = join(
  configuration.get(ConfigurationName.WorkspaceFolder) || ROOT,
  HIDDEN
)
export const DEFAULT_FILE = join(
  configuration.get(ConfigurationName.WorkspaceFolder) || ROOT,
  HIDDEN,
  '.prohibit.js'
)
