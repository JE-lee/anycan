const fs = require('fs')
const path = require('path')
const config = require('../config/defaultConfig')
const axios = require('axios')
let routes = []
/**
 *
 * @param {string} path
 * @return 返回一个RegExp对象
 */
function _generateReg(path) {
  return new RegExp(path)
}

/**
 *
 * @param {string} url
 */
function _findRoute(url) {
  return routes.find(item => item.from.test(url))
}

function _getRedirectUrl(url, route) {
  let redirectUrl = route.to
  let fgroup = url.match(_generateReg(route.from))
  let isTo = /\(\d+\)/.test(route.to)
  // TODO: query params处理是否不智能
  isTo && redirectUrl.replace(/\(\d+\)/g, (match) => fgroup[match] || '')
  return redirectUrl
}

// TODO: 下个版本使用stream来转发
module.exports = async function (url, req, res) {
  let route = _findRoute(url)
  if (route) {
    // 转发路由
    let redirectUrl = _getRedirectUrl(url, route)
    let response = await axios.request({
      url: redirectUrl,
      method: req.method,
      headers: Object.assign({}, req.headers, route.headers),
      transformRequest: [data => data] // 转发data

    }).catch(err => {
      // TODO: 这里属于系统发送请求失败，应该提示管理员
      console.error(err)
      throw err
    })

    let headers = response.headers
    for (let header in headers) {
      res.setHeader(header, headers[header])
    }
    res.statusCode = response.status //axios的响应码
    res.end(response.data)
    return Promise.reject({ next: false })
  } else {
    return { next: 'true' }
  }
}

// 处理/redirect.json 转发配置文件
try {
  let redirect = fs.readFileSync(path.join(config.root, './redirect.json'), { encoding: 'utf-8' })
  let reConfig = JSON.parse(redirect)
  //提取所有的路由，并且将form，to字段转换成正则表达式
  routes = reConfig.route
} catch (error) {
  console.info('no redirect.json', error)
}
