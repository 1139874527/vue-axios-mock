type IMethod = 'delete' | 'get' | 'post' | 'put' | 'patch' | 'options' | 'head' | 'request'

export interface GlobalConfig {
  mock?: boolean
  fuzzy?: boolean
  timeout?: number
  method?: IMethod
  status?: number
  responseType?: any
  tip?: boolean
}

interface ICallbackItem {
  mockUrl: string
  mockStatus: number
  mockTimeout: number
  axiosUrl: string
  axiosMethod: IMethod
  axiosBody: any
  axiosConfig: any
}

export interface OptionConfig extends GlobalConfig {
  callback?: (mockData: any, callbackItem: ICallbackItem) => any
  data?: any
}

declare const aMock: any

export default aMock
