import * as path from 'path'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import * as fse from 'fs-extra'
import { promisify } from 'util'

export async function readdirWithFileTypes(
  fullpath: string,
  includes: string[] = [],
  excludes: string[] = ['.DS_Store']
): Promise<fs.Dirent[]> {
  const res = await promisify(fs.readdir)(fullpath, { withFileTypes: true })
  return includes.length
    ? res.filter(
        (item: fs.Dirent) =>
          includes.includes(item.name) && !excludes.includes(item.name)
      )
    : res.filter((item: fs.Dirent) => !excludes.includes(item.name))
}

export function getExtname(fullpath: string): string {
  return path.basename(fullpath)
}

export async function getDirent(fullpath: string): Promise<fs.Dirent> {
  const root = path.resolve(fullpath, '../'),
    name = path.basename(fullpath)

  const res = await readdirWithFileTypes(root, [name])
  return res[0]
}

export function fullname(fullpath: string): string {
  return path.basename(fullpath)
}

export function mv(src: string, dst: string) {
  return fs.renameSync(src, dst)
}

export function remove(fullpath: string) {
  return fse.removeSync(fullpath)
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

export function listFile(fullpath: string): string[] | null {
  return fs.existsSync(fullpath)
    ? fs.readdirSync(fullpath).filter((pathname) => pathname !== '.DS_Store')
    : null
}

export function move(src: string, dest: string) {
  return fse.moveSync(src, dest)
}
