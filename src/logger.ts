import { extensionOutputChannelName } from './constants'

const ConsolePrefix = `[${extensionOutputChannelName}]`

export enum TraceLevel {
  Silent = 'silent',
  Fatal = 'fatal',
  Error = 'error',
  Warn = 'warn',
  Log = 'log',
  Info = 'info',
  Success = 'success',
}

export function timestamp(): string {
  const now = new Date()
  return `[${now
    .toISOString()
    .replace(/T/, ' ')
    .replace(/\..+/, '')}:${`00${now.getUTCMilliseconds()}`.slice(-3)}]`
}

export function composeMessage(message: string): string {
  return `${timestamp()}${ConsolePrefix} ${message ?? ''}`
}
