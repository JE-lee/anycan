
module.exports = {
    root:process.cwd(),
    host:'localhost',
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
