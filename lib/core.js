import mockInfo from "./utils.js"
import { getPromiseData,getHookArray } from "./utils.js"
import axios  from 'axios';

axios.realAxios = {}

let xhrMethod = ["delete","get","post","put","patch","options","head","request"]

//代理方法
function hookFunction(attr,mockArray) {
    // 创建需要mock的对象
    let hookItem = null
    return function(){
        var args = [].slice.call(arguments)
        //1.request方法需要特殊处理
        if(attr === "request") return
        //2.如果接口请求时设置有mockId，进行匹配查找（此时，url，method等属性设置无效）
        if( args &&  args[2] &&  args[2].mockId )  {
            hookItem = mockArray.find(res => res.mockId === args[2].mockId)  
        }
        //3.根据url，fuzzy，method关键词进行信息匹配
        if(!hookItem){
            //模糊匹配可能匹配到多条数据
            let hookArray = getHookArray(args,mockArray)
            if( hookArray.length && hookArray.length > 0){
                hookArray = hookArray.filter( res => {
                    if(res.method){
                        return res.method === attr
                    }else{
                        return res
                    }
                })
                if(hookArray.length === 1){
                    hookItem = hookArray[0]
                }
                if(hookArray.length > 1){
                    console.error(`【axios】${args[0]}的请求匹配到多条配置，修改配置信息！`);
                }
            }
        }
        //返回自定义的数据
        if(hookItem) {
            return getPromiseData(hookItem)
        }
        //原生的方法
        if(!hookItem) return axios.realAxios[attr].apply(axios, args);
    } 
}


function axiosMock () {
    let arg = [].slice.call(arguments)
    //获取mock信息
    let mockObj = new mockInfo(arg)
    if(!mockObj.options) return
    let mockArray = mockObj.config.filter(res => res.mock)
    for( let attr in axios){
        let type = typeof axios[attr]
        if (type === "function" && xhrMethod.some(item => item === attr)) {
            //备份原生方法
            axios.realAxios[attr] = axios[attr]
            //代理方法
            axios[attr] = hookFunction(attr,mockArray)
        } 
    } 
}
export {
    axiosMock
}
