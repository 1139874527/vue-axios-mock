import MockConfig from "./mockObject.js"
import log from "./log.js"
import axios  from 'axios';

let tip = true
function getHookArray(args,configArray){
    let baseUrl = axios.defaults.baseURL || ""
    let fulUrl =  baseUrl + args[0]
    fulUrl = fulUrl.replace(/\/\//g,"/")
    let hookArray = configArray.filter(item =>{
        if(item.fuzzy){
            let fulurlArray = fulUrl.split("/")
            let urlArray = item.url.split("/")
            let find = urlArray.every(res => {
                return fulurlArray.some(item => item === res)
            })
            return find
        }else{
           return ( fulUrl === item.url || fulUrl ===  "/" + item.url )
        }
    })
    return hookArray || []
}

function axiosMock () {
    let arg = [].slice.call(arguments)
    if(arg[1] && arg[1].mock === false) return log.pretty("axios-hook-mock","您已经关闭代理！")
    if(arg[1] && arg[1].tip === false) tip = false
    let mockObj = new MockConfig(arg)
    if(!mockObj.options) return log.pretty("axios-hook-mock","插件已经启用，但是未获取到任何配置项！")
    let mockArray = mockObj.config.filter(res => res.mock)
    let xhrMethod = ["delete","get","post","put","patch","options","head","request"]
    axios.realAxios = {}
    for( let attr in axios){
        let type = typeof axios[attr]
        if (type === "function" && xhrMethod.some(item => item === attr)) {
            axios.realAxios[attr] = axios[attr]
            axios[attr] = hookFunction(attr,mockArray)
        } 
    } 
    function hookFunction(attr,mockArray) {
        return function(){
            let hookItem = null
            var args = [].slice.call(arguments)
            if(attr === "request") return
            if( args &&  args[2] &&  args[2].mockId )  {
                hookItem = mockArray.find(res => res.mockId === args[2].mockId) 
            } 
            if(!hookItem){
                let hookArray = getHookArray(args,mockArray)
                if( hookArray.length && hookArray.length > 0){
                    hookArray = hookArray.filter( res => {
                        if( res.method ){
                            return res.method.toLowerCase() === attr
                        }else{
                            return res
                        }
                    })
                    if(hookArray.length === 1){
                        hookItem = hookArray[0]
                    }
                    if(hookArray.length > 1){
                        let url = args[0].split("/")[args[0].split("/").length - 1]
                        log.pretty(`axios-hook-mock`,`${url}的请求匹配到多条配置，修改配置信息！`);
                    }
                }
            }
            if(hookItem) {  
                if(hookItem.tip && tip) {
                    let lastUrl = args[0].slice(0,1) === "/" ? args[0] : "/" + args[0]
                    log.pretty(`axios-hook-mock：${attr}`,location.protocol + "//" + location.host + lastUrl )
                }
                let callbackItem = {
                    mockUrl:hookItem.url,
                    mockStatus:hookItem.status,
                    mockTimeout:hookItem.timeout,
                    axiosUrl:args[0],
                    axiosMethod:attr,
                    axiosBody:args[1] || null,
                    axiosConfig:args[2] || null,
                }
                if(hookItem.callback &&  hookItem.responseType !== "axios"){
                    hookItem.data  =  hookItem.callback(hookItem.data,callbackItem) || null
                }
                if(hookItem.callback &&  hookItem.responseType == "axios"){
                    hookItem.data.data  =  hookItem.callback(hookItem.data.data,callbackItem) || null
                }
                const promise = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(hookItem.data);
                    }, hookItem.timeout);
                });
                return promise  
            }
            if(!hookItem) return axios.realAxios[attr].apply(axios, args);
        } 
    }
}
export {
    axiosMock
}
