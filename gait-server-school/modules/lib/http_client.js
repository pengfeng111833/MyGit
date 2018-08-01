'use strict';

let Fiber = require('fibers');
let util = require('util');
let http = require('http');
let defaultRequester = http.request;
let qs = require('qs');

class HttpClient {
    constructor() {
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:44.0) Gecko/20100101 Firefox/44.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
            'Connection': 'keep-alive'
        };
        
        this.cookies = {
        };
    }

    getHeaders() {
        let headers = {};
        Object.keys(this.headers).forEach(headerName => {
            headers[headerName] = this.headers[headerName];
        });

        return headers;
    }

    requestSync(opt) {
        let fiber = Fiber.current;

        let result = {
            status: 'successful'
        };

        this.request(opt, (body, res, req) => {
            result.data = body;
            result.res = res;
            result.req = req;

            fiber.run();
        }, (location, res, req) => {
            result.location = location;
            result.res = res;
            result.req = req;
            result.status = 'redirect';
            
            fiber.run();
        }, (body, res, req) => {
            result.data = body;
            result.res = res;
            result.req = req;
            result.status = 'error';

            fiber.run();
        });

        Fiber.yield();

        if ( result.status == 'error' ) {
            throw new Error(JSON.stringify({
                statusCode: result.res.statusCode,
                res: result.res,
                data: result.data
            }));
        }

        return result;
    }

    request(opt, onData, onRedirect, onError) {
        let self = this;

        let query = opt.query;
        if ( query ) {
            delete opt.query;
        }

        let data = opt.data;
        if ( data ) {
            delete opt.data;
        }

        if ( query ) {
            opt.path += '?' + qs.stringify(query);
        }

        let headers = this.getHeaders();
        if ( data ) {
            headers['Content-Length'] = data.length;
        }

        let dataType = opt.dataType;
        if ( dataType ) {
            headers['Content-Type'] = dataType;
            delete opt.dataType;
        }

        let cookies = this.loadCookies(headers);
        headers['Cookie'] = cookies;

        opt.headers = headers;

        let requester = defaultRequester;
        if ( opt.requester ) {
            requester = opt.requester;
            delete opt.requester;
        }

        let req = requester(opt, function (res) {  
            if ( res.statusCode ) {
                if ( res.headers['set-cookie'] ) {
                    self.saveCookies(res.headers['set-cookie']);
                }
            }

            let body = Buffer.from([]);  
            let called = false;
            res.on('data', function (data) { 
                body = Buffer.concat([ body, data ]);
            })  
            .on('end', function () { 
                if ( !called ) {
                    called = true;
                    if ( res.statusCode != 200 ) {
                        onError(body, res, req);
                    }
                    else {
                        onData(body, res, req);
                    }
                }
            });  

            if ( res.statusCode == 302 ) {
                if ( !called ) {
                    called = true;
                    onRedirect(res.headers.location, res, req);
                }
            }
        });  

        if ( data ) {
            req.write(data + "\n");  
        }

        req.on('error', error => {
            onError(error, {});
        });

        req.end();  
    }

    saveCookies(cookies) {
        let self = this;

        cookies.forEach(cookieString => {
            let fields = cookieString.split(';').map(str => str.trim());
            let field = fields[0];
            let elements = field.split('=').map(str => str.trim());
            self.cookies[elements[0]] = elements[1];
        })
    }

    loadCookies(header) {
        let self = this;

        return Object.keys(this.cookies).map(cookieName => {
            return cookieName + '=' + self.cookies[cookieName];
        }).join('; ');
    }
}

module.exports = HttpClient;
