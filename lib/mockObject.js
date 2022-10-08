import log from "./log.js"

class MockConfig {
    constructor(args) { 
        this.args = args
        this.options = this.objValidator()
        this.config = []
        this.init()
    }
    objValidator() {
        let options = this.args[0]
        if(!options ) return null
        if( typeof options !== 'object' || Array.isArray(options) ) return null
        if(Object.keys(options).length === 0) return null
        return options
    }
    init(){
        if(!this.options) return
        for(let i in this.options){
            let nameInfo , url , type
            nameInfo = i.split("|"); url = nameInfo[0]; type = nameInfo[1] || null
            let item
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
            log.pretty("axios-hook-mock",err)
        }
        if(comments.length === 0) return null
        let searchName = jsonName.indexOf(".json") > -1 ? jsonName : jsonName + '.json'
        let jsonAarry = []
        comments.keys().forEach(res =>{
            let name = res.match(/^.\/(.*)$/)[1]
            jsonAarry.push(name)
        })
        let item = jsonAarry.find(res => res === searchName)
        if(item){
            let jsonData = null
            try{
                jsonData = require("../../../aMock/" + item)
            }catch(err){
                log.pretty("axios-hook-mock",err)
            }
            return jsonData 
        }else{
            return null;
        }
    }
    getDeafaultObj(){
        let config = this.args[1] || {}
        return {
            mock:config.mock ? config.mock : true,
            mockId:null,
            fuzzy:config.fuzzy ? config.fuzzy : true,
            method:null,
            status:config.status ? config.fstatus : 200,
            timeout:config.timeout ? config.timeout : 1000,
            responseType:config.responseType ? config.responseTypet : "axios",
            tip:config.tip ? config.tip : true,
            callback:null,
        }
    }
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
                    item.data = this.getData(data,item)
                }else if(this.objValidator(obj)){
                    if(obj.jsonName){
                        for(let i in item){
                            item[i] = obj[i] ?  obj[i] : item[i]
                        }
                        item.jsonName = obj.jsonName
                        let data = this.getJsonData(item.jsonName)
                        item.data = this.getData(data,item)
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
export default MockConfig