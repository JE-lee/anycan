const { cache } = require('../config/defaultConfig')

function refreshRes(stats, res) {
  const { maxAge, expires, cacheControl, lastModified, eTag } = cache
  //设置到期时间
  if (expires) {
    res.setHeader('Expires', (new Date(Date.now() + maxAge * 1000)).toUTCString())
  }
  //设置文件到期间隔
  if (cacheControl) {
    res.setHeader('Cache-Control', `Public,max-age=${maxAge}`)
  }
  //设置文件的最后修改时间
  if (lastModified) {
    res.setHeader('Last-Modified', stats.mtime.toUTCString())
  }
  //设置是否过期标志
  if (eTag) {
    res.setHeader('ETag', `${stats.size}-${stats.mtime.toUTCString().replace(',', '')}`)
  }
}

module.exports = function isFresh(stats, req, res) {
  //先根据配置文件的需要设置响应头
  refreshRes(stats, res)
  const lastModified = req.headers['if-modified-since'] // 浏览器记录的上次修改时间
  const etag = req.headers['if-none-match'] // 浏览器记录的上次的etag，和lastModified用一个就可以了

  if (!lastModified && !etag) {
    return false
  }

  if (lastModified && lastModified !== res.getHeader('Last-Modified')) {
    return false
  }

  if (etag && etag !== res.getHeader('ETag')) {
    return false
  }
  return true

}
