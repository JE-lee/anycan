const http = require('http')
const config = require('./config/defaultConfig.js')
const chalk = require('chalk')
const path = require('path')
const route = require('./helper/route')
const redirect = require('./helper/redirect')

const server  =  http.createServer((req , res)=>{
    //查看是否需要转发
    //state1:只做路径的判断
    let url = req.url
    const redir = redirect(url,req,res)
    redir.then((response)=>{
        if(response !== true){
            //req.url会得到除了host和端口后面的路径。
            //如果是根目录，就返回/index.html
            if(url === '/'){
                url = '/index.html'
            }
            const filepath = path.join(config.root,url)
            route(req,res,filepath)
        }
    })
       
})

server.listen(config.port,config.host,()=>{
    const addr = `${config.host}:${config.port}` 
    console.info(`The server start at ${chalk.green(addr)} !!!`)
})