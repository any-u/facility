import * as path from 'path'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import * as fse from 'fs-extra'

export function fullname(fullpath: string): string {
  return path.basename(fullpath)
}

export function mv(src: string, dst: string) {
  return fs.renameSync(src, dst)
}

export function remove(fullpath: string) {
  return fse.removeSync(fullpath)
}

export function exist(fullpath: string): boolean {
  return fs.existsSync(fullpath)
}

export function data(fullpath: string): string | null {
  return fs.existsSync(fullpath) ? fs.readFileSync(fullpath).toString() : null
}

export function mkdir(fullpath: string) {
  if (fs.existsSync(fullpath)) return
  mkdirp.sync(fullpath)
}

export function stat(fullpath: string) {
  return fs.statSync(fullpath)
}

export function write<T>(fullpath: string, data: T) {
  return fs.writeFileSync(fullpath, data)
}

export function append<T>(fullpath: string, data: T) {
  return fs.appendFileSync(fullpath, data)
}

export function move(src: string, dest: string) {
  return fse.moveSync(src, dest)
}
