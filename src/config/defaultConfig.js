
module.exports = {
    root:process.cwd(),
    host:'127.0.0.1',
    port:'9527',
    compress:/\.(js|css|html|md)$/,
    cache:{
        maxAge:600,
        expires:true,
        cacheControl:true,
        lastModified:true,
        eTag:true
    }
}