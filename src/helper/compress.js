const {createGzip,createDeflate} = require("zlib")
module.exports = (rs,req,res) => {
    const acceptEncoding = req.headers['accept-encoding']
    //浏览器不支持任何的压缩方式或者服务器不支持的压缩方式
    if(!acceptEncoding || !acceptEncoding.match(/\b(gzip|deflate)\b/) ){
        return rs
    }
    if(acceptEncoding.match(/\bgzip\b/)){
        res.setHeader('Content-Encoding','gzip')
        //返回目标流的引用
        return rs.pipe(createGzip())
    }else if(acceptEncoding.match(/\deflate\b/)){
        //设置响应头的压缩信息
        res.setHeader('Content-Encoding','deflate')
        return rs.pipe(createDeflate())
    }
}