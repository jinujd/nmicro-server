import { ServerMeta } from "./ServerMeta.js"

export class ServerOptions {
    headersToExpose = [`Content-Disposition`, `x-developed-by`]
    middlewares = [] 
    app//express app object
    baseRouter
    isCorsEnabled = true
    constructor(options) { 
        options && Object.assign(this, options)
    }
    onAfterListen = (serverMeta = new ServerMeta()) => {
        const {port, isHttps} = serverMeta
        console.log(`Server listening on port ${port} with HTTPS flag ${isHttps}`)
    }
}