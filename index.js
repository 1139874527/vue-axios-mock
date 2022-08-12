

import { axiosMock } from './lib/core.js'
import log from "./lib/log.js"
export default (Vue,options,config = null) => { 
    if(options) return axiosMock(options,config)
    let comments , modlue
    try{
        comments = require.context("../../aMock", true, /.(js)$/) 
        if( comments.keys() && comments.keys().length > 0){
            let nameArray = []
            comments.keys().forEach(res => {
                    let name = res.match(/^.\/(.*).js$/)[1] || ""
                    nameArray.push(name)
            })
            if(nameArray.find(res => res === "config")){
                modlue = require("../../aMock/config.js")
                return axiosMock(modlue.default,modlue.config)
            }
        }
    }catch(err){
        log.pretty("axios-mock",err);
    }
}