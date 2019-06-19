module.exports = (totalSize, req, res) => {
  const range = req.headers['range']
  //没有设置range请求头，直接返回整个文件
  if (!range) {
    return {
      code: 200
    }
  }
  const sizes = range.match(/bytes=(\d*)-(\d*)/)
  const end = sizes[2] || totalSize - 1
  const start = sizes[1] || 0
  //如果请求的end大于整个文件大小
  if (start > end || end > totalSize || start < 0) {
    return { code: 200 }
  }
  res.setHeader('Accept-Ranges', 'bytes')
  res.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`)
  res.setHeader('Content-Length', end - start + 1)
  return {
    code: 206,//返回的是部分内容，http协议
    start: parseInt(start),
    end: parseInt(end)
  }
}
