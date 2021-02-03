import * as _ from 'lodash'
import * as vscode from 'vscode'
import * as zhCNTextMap from '../locales/zh-CN.json'
import * as enUSTextMap from '../locales/en-US.json'

export interface ITextMap {
  // "${namespace}.${EXTENSION_NAME}.${moudelName}.${fieldName}": "xxx"
  [key: string]: string
}

export class I18nManager {
  localesTextMap: { [locale: string]: ITextMap } = {}

  currentTextMap: ITextMap = {}

  init() {
    this.registry('zh-cn', (zhCNTextMap as any).default)
    this.registry('en', (enUSTextMap as any).default)

    this.setLocal(vscode.env.language)
  }

  registry(locale: string, text: ITextMap) {
    this.localesTextMap[locale] = text
  }

  setLocal(locale: string) {
    this.currentTextMap =
      this.localesTextMap[locale] ||
      this.localesTextMap[Object.keys(this.localesTextMap)[0]]
  }

  format(contentKey: string, args?: object) {
    const i18nformatString = this.currentTextMap[contentKey]
    if (!i18nformatString) {
      return ''
    }

    return args ? _.template(i18nformatString)(args) : i18nformatString
  }
}

const i18nManager = new I18nManager()
export default i18nManager
