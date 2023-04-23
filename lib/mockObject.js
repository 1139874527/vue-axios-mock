import log from './log.js'

class MockConfig {
  constructor(args) {
    this.args = args
    // 根据config获取用户配置项
    this.options = this.getUserOptionsByConfig()
    // 根据用户配置项生成的配置列表
    this.config = []
    this.init()
  }
  getUserOptionsByConfig() {
    let options = this.args[0]
    if (!options) return null
    if (typeof options !== 'object' || Array.isArray(options)) return null
    if (Object.keys(options).length === 0) return null
    return options
  }
  init() {
    if (!this.options) return
    for (let i in this.options) {
      let nameInfo, url, type
      nameInfo = i.split('|')
      url = nameInfo[0]
      type = nameInfo[1] || null
      let item
      if (nameInfo.length === 1) {
        // 普通配置
        item = this.getPresetsItem()
        item.data = this.getData(this.options[i])
      } else {
        // cus配置或json配置
        item = this.getTypeItem(type, this.options[i])
      }
      item.url = url
      this.config.push(item)
    }
  }
  getJsonData(jsonName) {
    let comments = []
    try {
      comments = require.context('../../../aMock', true, /.(json)$/)
    } catch (err) {
      log.pretty('vue-axios-mock', err)
    }
    if (comments.length === 0) return null
    let searchName = jsonName.indexOf('.json') > -1 ? jsonName : jsonName + '.json'
    let jsonAarry = []
    comments.keys().forEach((res) => {
      let name = res.match(/^.\/(.*)$/)[1]
      jsonAarry.push(name)
    })
    let item = jsonAarry.find((res) => res === searchName)
    if (item) {
      let jsonData = null
      try {
        jsonData = require('../../../aMock/' + item)
      } catch (err) {
        log.pretty('vue-axios-mock', err)
      }
      return jsonData
    } else {
      return null
    }
  }
  // 根据用户配置获取默认的配置项
  getPresetsItem() {
    let config = this.args[1] || {}
    return {
      mock: config.mock ? config.mock : true,
      mockId: null,
      fuzzy: config.fuzzy ? config.fuzzy : true,
      method: config.method ? config.method : 'post',
      status: config.status ? config.status : 200,
      timeout: config.timeout ? config.timeout : 1000,
      responseType: config.responseType ? config.responseType : 'axios',
      tip: config.tip ? config.tip : true,
      callback: null
    }
  }
  getTypeItem(type, obj) {
    let item = this.getPresetsItem()
    switch (type) {
      case 'cus':
        if (this.getUserOptionsByConfig(obj)) {
          for (let i in item) {
            item[i] = obj[i] ? obj[i] : item[i]
          }
          item.data = this.getData(obj.data, item)
        } else {
          item.data = this.getData(obj, item)
        }
        break
      case 'json':
        if (typeof obj === 'string') {
          let data = this.getJsonData(obj)
          item.data = this.getData(data, item)
        } else if (this.getUserOptionsByConfig(obj)) {
          if (obj.jsonName) {
            for (let i in item) {
              item[i] = obj[i] ? obj[i] : item[i]
            }
            item.jsonName = obj.jsonName
            let data = this.getJsonData(item.jsonName)
            item.data = this.getData(data, item)
          } else {
            item.data = this.getData(obj, item)
          }
        } else {
          item.data = this.getData(obj, item)
        }
        break
      default:
        item.data = this.getData(obj, item)
    }
    return item
  }
  getData(sourceData, item = {}) {
    if (!item.responseType || item.responseType === 'axios') {
      return {
        data: sourceData ? sourceData : null,
        status: item.status ? item.status : 200,
        statusText: 'OK',
        headers: {},
        config: {},
        request: {}
      }
    }
    return sourceData
  }
}
export default MockConfig
