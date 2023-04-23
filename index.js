import { axiosMock } from './lib/core.js'
import log from './lib/log.js'
export default (Vue, options, config = null) => {
  log.info('vue-axios-mock', '本插件仅在开发环境下生效！文档地址：https://www.npmjs.com/package/vue-axios-mock', '#35495E')
  // 仅开发模式代码生效
  if (process.env.NODE_ENV !== 'development') return
  // 参数式代理优先级更高
  if (options) return axiosMock(options, config)
  try {
    let fileList = require.context('../../aMock', false, /.((j|t)s)$/).keys()
    if (fileList.length === 0 || !fileList.some((res) => res.includes('config'))) {
      return log.info('vue-axios-mock', '使用本插件，请在项目根目录下创建：aMock/config.js')
    }
    let configName = fileList.some((res) => res.includes('config.ts')) ? 'config.ts' : 'config.js'
    let module = require(`../../aMock/${configName}`)
    return axiosMock(module.default, module.config)
  } catch (err) {
    log.info('vue-axios-mock', err, '#35495E')
  }
}
