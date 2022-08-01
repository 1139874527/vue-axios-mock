import axios  from 'axios';
let baseUrl = axios.defaults.baseURL || ""
function getHookArray(args,configArray){
    //生成完成的路径
    let fulUrl =  baseUrl + args[0]
    fulUrl = fulUrl.replace(/\/\//g,"/")
    //根据url和fuzzy关键词进行匹配
    let hookArray = configArray.filter(item =>{
        //模糊查询
        if(item.fuzzy){
            return fulUrl.indexOf(item.url) > -1
        }else{
          //精准查询
           return ( fulUrl === item.url || fulUrl ===  "/" + item.url )
        }
    })
    return hookArray || []
}

function getPromiseData(hookItem){
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(hookItem.data);
        }, hookItem.timeout);
    });
    return promise  
}


       //4.判断是否存在mock数据，如无，放弃代理
        // if(hookItem){
        //     //如果mock 自定义data存在，返回该值
        //     if(hookItem.data) return
        //     //如果data不存在，返回json内的内容
       
        //     if(jsonAarry.length === 0) return hookItem = null
        //     let isHaveJsonData = jsonAarry.some(res => res === hookItem.fileName)
        //     if(!isHaveJsonData) return hookItem = null
        //     let mockData = null
        //     try{
        //         mockData = require("../../../aMock" + hookItem.fileName + '.json')
        //     }catch(err){
        //         console.log("【mock】:",err);
        //     }
        //     hookItem.data = mockData 
        // }

class Utils {
    //args[0]为options配置项，args[1]未初始化预设值
    constructor(args) { 
        this.options = this.objValidator(args[0])
        this.config = []
        this.init()
    }
    objValidator(options) {
        //必须包含配置对象
        if(!options ) return null
        //配置对象必须是对象类型  null , object , array 都是 object 类型
        if( typeof options !== 'object' || Array.isArray(options) ) return null
        //配置对象不能为空
        if(Object.keys(options).length === 0) return null
        return options
    }
    init(){
        if(!this.options) return
        for(let i in this.options){
            let nameInfo , url , type
            nameInfo = i.split("|"); url = nameInfo[0]; type = nameInfo[1] || null
            let item
            //如果没有|cus标识，直接将其属性值作为返回值
            if(nameInfo.length === 1){
                item = this.getDeafaultObj()
                item.data = this.getData(this.options[i])     
            }else{
                item = this.getTypeItem(type,this.options[i])
            }
            item.url = url
            this.config.push(item)
        } 
    }
    getJsonData(jsonName){
        let  comments = []
        try{
            comments = require.context("../../../aMock", true, /.(json)$/) 
        }catch(err){
            console.error("【axios】",err);
        }
        if(comments.length === 0) return null
        let searchName = jsonName.indexOf(".json") > -1 ? jsonName : jsonName + '.json'
        let jsonAarry = []
        comments.keys().forEach(res =>{
            let name = res.match(/^.\/(.*).json$/)[1]
            jsonAarry.push(name + '.json')
        })
        let item = jsonAarry.find(res => res === searchName)
        if(item){
            let jsonData = null
            try{
                jsonData = require("../../../aMock/" + item)
            }catch(err){
                console.error("【axios】",err);
            }
             return jsonData
        }else{
            return null;
        }
        

    }
    getDeafaultObj(cus){
        return {
            mock:true,
            mockId:null,
            fuzzy:true,
            method:null,
            status:200,
            timeout:1000,
            responseType:"axios",
        }
    }
    //根据自定义类型获取自定义配置
    getTypeItem(type,obj){
        let item =  this.getDeafaultObj()
        switch (type){
            case "cus":
                if(this.objValidator(obj)){
                    for(let i in item){
                        item[i] = obj[i] ?  obj[i] : item[i]
                    }
                    item.data = this.getData(obj.data,item)
                }else{
                    item.data = this.getData(obj,item)
                }
                break;
            case "json":
                if( typeof obj === 'string'){
                    let data = this.getJsonData(obj)
                    item.data = this.getData(data)
                }else if(this.objValidator(obj)){
                    if(obj.data){
                        for(let i in item){
                            item[i] = obj[i] ?  obj[i] : item[i]
                        }
                        item.data = this.getData(obj.data,item)
                    }else{
                        item.data = this.getData(obj,item)
                    }
                }else{
                    item.data = this.getData(obj,item)
                }
                break;
            default:
                item.data = this.getData(obj,item)
        }
        
        
        
        return item  
    }
    //根据responseType类型  生成自定义数据
    getData(soucreData,item = {}){
        if(!item.responseType || item.responseType === "axios") {
             return {
                data: soucreData ? soucreData : null,
                status: item.status ? item.status : 200,
                statusText: 'OK',
                headers: {},
                config: {},
                request: {}
            }
        }
        return soucreData 
    }
}

export {
    getHookArray,
    getPromiseData,
}
export default Utils