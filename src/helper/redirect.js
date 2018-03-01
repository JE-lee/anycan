const fs = require('fs')
const path = require('path')
const config = require('../config/defaultConfig')
const axios = require('axios')
let routes = null
/**
 * 
 * @param {string} path 
 * @return 返回一个RegExp对象
 */
function _normalizeText(path){
    return path.indexOf('(') === -1 ? new RegExp(`(${path})`) : new RegExp(path)
}
/**
 * 
 * @param {string} url 
 */
function findRoute(url){
    return routes.find((item)=>{
        if(item.from.test(url)){
            return true
        }
    })
}
try {
    let redirect = fs.readFileSync(path.join(config.root,'./redirect.json'),{encoding:'utf-8'})
    let reConfig = JSON.parse(redirect)
    //提取所有的路由，并且将form，to字段转换成正则表达式
    routes = reConfig.route.map((item)=>{
        let from = _normalizeText(item.from)
        //let to = _normalizeText(item.to)
        return Object.assign({},item,{from})
    })
    
    
} catch (error) {
    console.info('no redirect.json',error)
}

function _getRedirectUrl(url,route){
    let redirectUrl = ''
    let fgroup = url.match(route.from)
    let pattern = /\((\d)\)/g
    let t = pattern.exec(route.to)
    if(t){
        redirectUrl = route.to
        while(t){
            let g = parseInt(t[1])
            if(fgroup[g]){
                redirectUrl = redirectUrl.replace(t[0],fgroup[g])
            }
            t = pattern.exec(route.to)
        }
    }else{
        //to没有使用，那就将整个to当作url
        redirectUrl = route.to
    }
    return redirectUrl
}

module.exports =async function(url,req,res){
    if(!routes){
        return false
    }
    //找到合适的route
    let route = findRoute(url)
    if(!route){
       // console.info('no route redirect')
        return false
    }else{
        //console.info('route redirect')
        let redirectUrl = _getRedirectUrl(url,route)
        let response = await axios.request({
            url:redirectUrl,
            method:req.method,
            headers:Object.assign({},req.headers,route.headers)
        }).catch((err)=>{
            console.error(err)
            return true
        })
        let headers = response.headers
        for(let header in headers){
            res.setHeader(header,headers[header])
        }
        res.statusCode = response.status
        let ret = response.data

        if (route.isJSON && typeof ret === 'string')  {
            var reg = /^\w+\(({[^()]+})\)$/
            var matches = ret.match(reg)
            if (matches) {
              ret = JSON.parse(matches[1])
            }
            ret = JSON.stringify(ret)
          }
        if(typeof ret === 'object'){
            ret = JSON.stringify(ret)
        }
        //如果是字符串，就按照jsonp的格式转换成json字符串
        res.end(ret)
        return true
    }
   

     
     
}