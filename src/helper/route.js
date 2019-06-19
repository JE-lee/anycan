
const fs = require('fs')
const promisify = require('util').promisify
const stat = promisify(fs.stat)
const path = require('path')
const readdir = promisify(fs.readdir)
const config = require('../config/defaultConfig')
const Handlebars = require('handlebars')
const tplpath = path.join(__dirname, '../template')
const mimeType = require('./mime')
const compress = require('./compress')
const range = require('./range')
const isFresh = require('./cache')
//读取文件夹模板
const dirtplBuffer = fs.readFileSync(path.join(tplpath, './dir.html'))
const dirtpl = Handlebars.compile(dirtplBuffer.toString())


module.exports = async function (req, res, filepath) {
  try {
    const stats = await stat(filepath)
    if (stats.isFile()) {
      //请求的是文件路径
      const mime = mimeType(filepath)
      res.setHeader('Content-Type', mime)
      //判断文件是否已经过期
      if (isFresh(stats, req, res)) {
        //如果文件没有过期，那么返回304，并且不返回任何响应体信息。
        res.statusCode = 304
        res.end()
        return Promise.reject({ next:false })
      }
      //是否是范围请求
      let rs
      const { code, start, end } = range(stats.size, req, res)
      //返回整个文件
      if (code === 200) {
        rs = fs.createReadStream(filepath)
      } else {
        //返回文件的部分内容
        res.statusCode = 206
        rs = fs.createReadStream(filepath, { start, end })
      }
      //是否是需要要压缩的文件类型
      //返回一个数组，如果没有匹配到，返回null
      if (filepath.match(config.compress)) {
        rs = compress(rs, req, res)
      }
      rs.pipe(res)
    } else if (stats.isDirectory()) {
      //请求的是一个文件夹路径
      res.statusCode = 200
      //设置响应头//这里没有做文件夹是否存在的处理
      res.setHeader('Content-Type', 'text/html')
      const files = await readdir(filepath)
      const dir = path.relative(config.root, filepath)

      let html = dirtpl({
        title: path.basename(filepath),
        files: files.map((item) => {
          return {
            file: item,
            icon: mimeType(item)
          }
        }),
        dir: dir ? `/${dir}` : ''
      })
      res.end(html)
    }

    return Promise.reject({ next: false })
  } catch (ex) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/plain')
    res.end(`${req.url} not found！+ error ${ex.toString()}`)
    return ({ next: true })
  }

}
