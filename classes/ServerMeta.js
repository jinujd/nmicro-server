export class ServerMeta {
    port 
    isHttps
    key
    cert
    serverRef
    constructor(port, isHttps = false, key = null, cert = null) {
        this.port = port 
        this.key = key 
        this.cert = cert
        this.isHttps = isHttps
    }
    isHttpsServer() {
        return this.isHttps
    }
    getKey() {
        return this.key
    }
    getCert() {
        return this.cert
    }
    setServerRef(serverRef) {
        this.serverRef = serverRef
    }
    getServerRef() {
        return this.serverRef
    }
}