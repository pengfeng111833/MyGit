'use strict';

class ExpressRequest {
    constructor(options) {
        if ( !options ) {
            options = {};
        }
        
        this._contentType = null;
        this._content = null;
        this._status = null;
        
        if ( options.contentType ) {
            this._contentType = options.contentType;
        }
        if ( options._content ) {
            this._content = options.content;
        }
        if ( options._status ) {
            this._status = options.status;
        }
    } 
}

class ExpressResponse {
    constructor() {
        this._contentType = null;
        this._content = null;
    }
    
    json(obj) {
        this._contentType = 'application/json';
        this._content = JSON.stringify(obj);
    }
    
    send(str) {
        this._contentType = 'text/plain'; 
        this._content = str;
    }
    
    writeHead(status, content) {
        this._contentType = content['Content-Type'];
        this._status = status;
    }
    
    end(buffer) {
        this._content = buffer;
    }
    
    get contentType() {
        return this._contentType;
    }
    
    get content() {
        return this._content;
    }
    
    get status() {
        return this._status;
    }
}

module.exports = {
    ExpressRequest,
    ExpressResponse
}