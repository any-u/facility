import * as fs from 'fs'
import { promisify } from 'util'
import * as path from 'path'

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
