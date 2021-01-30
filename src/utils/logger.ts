import { OutputChannel } from 'vscode';
import * as chalk from 'chalk'
import * as dayjs from 'dayjs'

import { LOGGER_LEVEL, EXTENSION_NAME } from '../constants';

export enum Levels {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  SUCCESS = 3,
  ERROR = 4,
}

export const Colors = {
  debug: chalk.white,
  log: chalk.white,
  info: chalk.blueBright,
  success: chalk.greenBright,
  warn: chalk.bgYellow.black,
  error: chalk.bgRed.black,
}

export const Separators = {
  debug: '›',
  info: 'ℹ',
  log: '',
  success: '✅',
}

type Method = 'debug' | 'log' | 'info' | 'success' | 'warn' | 'error'

function prunePrefix(method: Method) {
  if (method === 'warn') {
    return Colors.warn(` ${method.toUpperCase()} `)
  }
  if (method === 'error') {
    return Colors.error(` ${method.toUpperCase()} `)
  }

  const separator = Separators[method]

  return separator
    ? `[${Colors[method](`${separator} ${method.toUpperCase()}`)}]`
    : `[${Colors[method](method.toUpperCase())}]`
}

class Logger {
  public static getInstance = (): Logger =>
  (Logger.instance = Logger.instance
    ? Logger.instance
    : // tslint:disable-next-line:semicolon
    new Logger(LOGGER_LEVEL, EXTENSION_NAME));

  private static instance?: Logger;
  private level: Levels;
  private output?: OutputChannel;

  private constructor(level: Levels, private tag: string) {
    this.level = level;
  }

  public debug(...args: string[]): void {
    if (this.level === Levels.DEBUG) {
      this.log('debug', ...args);
    }
  }

  public error(...args: string[]): void {
    if (this.level <= Levels.ERROR) {
      this.log('error', ...args);
    }
  }

  public info(...args: string[]): void {
    if (this.level <= Levels.INFO) {
      this.log('info', ...args);
    }
  }

  public success(...args: string[]): void {
    if (this.level <= Levels.SUCCESS) {
      this.log('success', ...args)
    }
  }

  public setLevel(level: Levels): void {
    this.level = level;
  }

  public setOutput(output: OutputChannel): void {
    this.output = output;
  }

  public warn(...args: string[]): void {
    if (this.level <= Levels.WARN) {
      this.log('warn', ...args);
    }
  }
  private log(
    method: Method,
    ...args: string[]
  ): void {
    const prefix = `facility>${method}:`;
    const message = [...args].join(' > ');
    if (this.output) {
      this.output.appendLine(`${prefix} ${message}`);
      this.devLog(method, ...args)
    }
  }

  private devLog(method: Method, ...args: string[]): void {
    const tag = chalk.bgRgb(160, 80, 246).white(`${this.tag ? `[${this.tag}]` : ''}`)
    const prefix = prunePrefix(method)
    const date = ` <${dayjs().format('YYYY-MM-DD HH:mm:ss')}> `
    const message = [...args].join(' > ')
    console.log(`${tag} ${prefix} ${date} ${message}`)
  }
}

export const logger = Logger.getInstance();
