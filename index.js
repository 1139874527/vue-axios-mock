

import { axiosMock } from './lib/core.js'

export default (Vue,options) => {
    let opt = null
    if(!options){
        let comments
        try{
            comments = require.context("../../aMock", true, /.(js)$/) 
            if( comments.keys() && comments.keys()[0]){
                let name = comments.keys()[0].match(/^.\/(.*).js$/)[1]
                if(name !== 'config') return
                let modlue = require("../../aMock/config.js")
                opt = modlue.default
            }
        }catch(err){
            console.error("【axios】",err);
        }
    }else{
        opt = options
    }
    axiosMock(opt)
}