import bodyParser from 'body-parser'
import cors from 'cors'
import http from 'http'
import https from 'https'
import { ServerMeta } from './ServerMeta.js' 
import { ServerOptions } from './ServerOptions.js'
import { Router } from 'nmicro-router'
export class Server {
    serverOptions =  new ServerOptions()
    app 
    routers = [new Router()]
    serverInfo = {
        http: new ServerMeta(),
        https: new ServerMeta()
    } 
    getApp() {
        return this.app
    }
    constructor(options = new ServerOptions()) { 
        options = options instanceof ServerOptions? options: new ServerOptions(options)
        this.init(options)
    }
    getRouters() {
        return this.routers
    } 
    getRouter(index = 0) {
        return this.routers[index]
    } 
    init(options = new ServerOptions()) {
        this.serverOptions = options
        this.initExpress()
        this.attachCommonMiddlewares() 
        this.attachMiddlewares(this.serverOptions.middlewares)
        this.clearRouters()
        this.attachRouter(new Router(this.serverOptions.baseRouter))
    }
    initExpress() {
        this.app = this.serverOptions.app 
    } 
    getHttpServer(app) {
        return http.createServer(app)
    }
    getHttpsServer(app, key = null, cert = null) {
        return key && cert?  https.createServer({key, cert}, app): https.createServer(app) 
    } 
    listen(port) {
        this.start(new ServerMeta(port))
    }
    start(options = new ServerMeta()) {
        if(!(options instanceof ServerMeta)) 
            throw new Error(`options must be an instance of ServerMeta`)
        const app  = this.getApp() 
        let serverRef 
        if(!options.isHttpsServer()) {
            serverRef =  this.getHttpServer(app)
            this.serverInfo.http = options
        } else {
            serverRef = this.getHttpsServer(app, options.getKey(), options.getCert())
            this.serverInfo.https = options
        }
        options.setServerRef(serverRef)  
        options.getServerRef().listen(options.port)
        this.serverOptions.onAfterListen(options)
    }
    handleCors() {
        if(!this.serverOptions.isCorsEnabled) return
        const allowedHeaders =  this.serverOptions.headersToExpose; // headers for preflight request
        const exposedHeaders =  this.serverOptions.headersToExpose// esp. for filename in csv export 
        this.getApp().use(cors({allowedHeaders, exposedHeaders})); 
    }
    attachMiddlewares(middlewares) {
        if(!middlewares) return
        middlewares.forEach(middleware =>  this.attachMiddleware(middleware))
    }
    attachMiddleware(middleware) {
        this.app.use(middleware)
    }
    clearRouters() {
        this.routers = []
    }
    attachRouter(router = new Router()) {
        this.routers.push(router)
        this.app.use(router.geExpressRouterInstance())
    }
    enableJsonRequestBody() {
        this.getApp().use(bodyParser.json())
    }
    enableUrlEncodedRequestBody() {
        this.app.use(bodyParser.urlencoded({ extended: true })) 
    }
    enableJsonResponseForError(){
        this.app.use((err, req, res, next) => { 
            if(!err) return next()
            const formattedError = {
                status: err.statusCode,
                message: err.message
            }
            return res.status(err.statusCode).json(formattedError); // Bad request
         
        });
    }
    attachCommonMiddlewares() {  
        this.enableUrlEncodedRequestBody()
        this.enableJsonRequestBody() 
        this.enableJsonResponseForError() 
        this.handleCors()
    }
}