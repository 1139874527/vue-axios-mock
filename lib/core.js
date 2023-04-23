import MockConfig from './mockObject.js'
import log from './log.js'
import axios from 'axios'

let tip = true
let baseUrl = axios.defaults.baseURL || ''
// 获取单个请求的模拟请求列表
function getHookArray(args, configArray) {
  let fulUrl = baseUrl + args[0]
  // 获取当前请求的完整url
  fulUrl = fulUrl.replaceAll('//', '/')
  let hookArray = configArray.filter((item) => {
    // 模糊匹配
    if (item.fuzzy) {
      return fulUrl.includes(item.url)
    } else {
      // 精确匹配
      return fulUrl === item.url || fulUrl === `/${item.url}` || fulUrl === `${item.url}/` || fulUrl === `/${item.url}/`
    }
  })
  return hookArray || []
}

function axiosMock() {
  // 配置参数
  let arg = [].slice.call(arguments)
  if (arg[1] && arg[1].mock === false) return
  if (arg[1] && arg[1].tip === false) tip = false
  // 获取配置数组
  let mockObj = new MockConfig(arg)
  if (!mockObj.options) return log.primary('vue-axios-mock', '请在aMock/config.js文件内进行接口拦截配置！')
  let mockArray = mockObj.config.filter((res) => res.mock)
  let xhrMethod = ['delete', 'get', 'post', 'put', 'patch', 'options', 'head', 'request']
  axios.realAxios = {}
  for (let attr in axios) {
    let type = typeof axios[attr]
    if (type === 'function' && xhrMethod.some((item) => item === attr)) {
      axios.realAxios[attr] = axios[attr]
      axios[attr] = hookFunction(attr, mockArray)
    }
  }
  function hookFunction(attr, mockArray) {
    return function () {
      let hookItem = null
      // axios请求参数[url,params,config]
      let args = [].slice.call(arguments)
      if (attr === 'request') return
      if (args && args[2] && args[2].mockId) {
        // 有mockID，直接返回mockId配置项
        hookItem = mockArray.find((res) => res.mockId === args[2].mockId)
      }
      // 如果用户未配置mockId，通过模拟请求列表拦生成hookItem
      if (!hookItem) {
        // 获取本次请求的模拟请求列表
        let hookArray = getHookArray(args, mockArray)
        // 通过method过滤
        let hookFilterList = hookArray.filter((res) => res.method.toLowerCase() === attr)
        // 匹配到一条模拟列表，直接使用
        if (hookFilterList.length === 1) {
          hookItem = hookArray[0]
        }
        // 匹配到多条模拟列表，提示用户，并根据匹配程度选择一项
        if (hookFilterList.length > 1) {
          let urlName = hookFilterList.map((res) => res.url)
          log.primary(`vue-axios-mock`, `${urlName.join('、')}均匹配到了${args[0]}接口，请关闭模糊匹配或者指定mockId！`)
        }
      }

      if (hookItem) {
        if (hookItem.tip && tip) {
          if (args[0].indexOf('http') > -1) {
            log.primary(`vue-axios-mock：${attr}`, args[0])
          } else {
            let lastUrl = args[0].slice(0, 1) === '/' ? args[0] : '/' + args[0]
            let url = location.host + baseUrl + lastUrl
            log.primary(`vue-axios-mock：${attr}`, location.protocol + '//' + url.replace('//', '/'))
          }
        }
        let callbackItem = {
          mockUrl: hookItem.url,
          mockStatus: hookItem.status,
          mockTimeout: hookItem.timeout,
          axiosUrl: args[0],
          axiosMethod: attr,
          axiosBody: args[1] ?? null,
          axiosConfig: args[2] ?? null
        }
        if (hookItem.callback && hookItem.responseType !== 'axios') {
          hookItem.data = hookItem.callback(hookItem.data, callbackItem) || null
        }
        if (hookItem.callback && hookItem.responseType == 'axios') {
          hookItem.data.data = hookItem.callback(hookItem.data.data, callbackItem) || null
        }
        const promise = new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(hookItem.data)
          }, hookItem.timeout)
        })
        return promise
      }
      if (!hookItem) return axios.realAxios[attr].apply(axios, args)
    }
  }
}
export { axiosMock }
