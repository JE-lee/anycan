#!/usr/bin/env node
const http = require('http')
const config = require('./config/defaultConfig.js')
const chalk = require('chalk')
const path = require('path')
const route = require('./helper/route')
const redirect = require('./helper/redirect')

const server = http.createServer((req, res) => {
  // 查看是否需要转发
  // 判断路径是否需要转发
  // TODO: 这里最好是做成和express一样的插件形式
  let url = req.url
  redirect(url, req, res).then(() => {
    //req.url会得到除了host和端口后面的路径。
    //如果是根目录，就返回/index.html

    if (url === '/') {
      url = '/index.html'
    }
    return route(req, res, path.join(config.root, url))
  }).catch(() => {})

})

server.listen(config.port, config.host, () => {
  const addr = `${config.host}:${config.port}`
  console.info(`The server start at ${chalk.green(addr)} !!!`)
})
