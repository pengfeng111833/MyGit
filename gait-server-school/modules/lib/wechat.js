'use strict'

var util = require('util');
var fs = require('fs');
const wechat = require('wechat');
var WechatApi = require('wechat-api');
let Fiber = require('fibers');
var http = require('../lib/http');
var https = require('../lib/https');
var outputLogger = require('../lib/loggers').output;
let config = require('../../config');
var wechatConfig = config.wechat;

const lib = {
    security: require('../lib/security')
};

function randomString(len) {
　　len = len || 32;
　　let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
　　let maxPos = $chars.length;
　　let pwd = '';
　　for ( let i = 0; i < len; i++) {
　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
　　}
　　return pwd;
}

class WechatServer {
    constructor(options) {
        const self = this;

        this._options = options;
        this._eventHandlers = new Map();
        this._deviceEventHandlers = new Map();

        this._eventHandler = (message, req) => {
            outputLogger.debug('event', message);
            const eventName = message.Event;

            if ( !self._eventHandlers.has(eventName) ) {
                return self._defaultEventHandler(message, req);
            }

            const eventHandler = self._eventHandlers.get(eventName);
            return eventHandler(message, req);
        };

        this._deviceEventHandler = (message, req) => {
            const eventName = message.Event;

            if ( !self._deviceEventHandlers.has(eventName) ) {
                return self._defaultEventHandler(message, req);
            }

            const eventHandler = self._deviceEventHandlers.get(eventName);
            return eventHandler(message, req);
        };

        this._defaultEventHandler = (message, req) => {
            console.log(message.Event);

            return '暂时不支持处理该事件';
        };
    }

    getDispatcher() {
        const self = this;

        const options = {
            token: config.wechat.basic.token,
            appid: config.wechat.basic.appId
        };

        console.log(options);

        const wechatDispatcher = wechat(options, wechat.text(function(message, req, res, next) {
                self.executeHandler('_textHandler', message, req, res, next);
            })
            .event(function(message, req, res, next) {
                self.executeHandler('_eventHandler', message, req, res, next);
            })
            .device_text(function(message, req, res, next) {
                outputLogger.debug('Device text: ', message);
                self.executeHandler('_deviceTextHandler', message, req, res, next);
            })
            .device_event(function(message, req, res, next) {
                outputLogger.debug('Device event: ', message);
                self.executeHandler('_deviceEventHandler', message, req, res, next);
            })
        );

        return wechatDispatcher;
    }

    executeHandler(handlerName, message, req, res, next) {
        const self = this;

        new Fiber(function() {
            if ( self[handlerName] ) {
                let reply = self[handlerName](message, req, res);
                console.log(reply);

                if ( reply ) {
                    res.reply(reply);
                }
            }
        }).run();
    }

    onText(textHandler) {
        this._textHandler = textHandler;

        return this;
    }

    onDefaultEvent(defaultEventHandler) {
        this._defaultEventHandler = defaultEventHandler;

        return this;
    }

    onDeviceText(deviceTextHandler) {
        this._deviceTextHandler = deviceTextHandler;

        return this;
    }
    
    onDeviceEvent(eventName, eventHandler, warningOnOverride) {
        if ( warningOnOverride && this._deviceEventHandlers.has(eventName) ) {
            outputLogger.warn(`Event ${eventName} exists, you will override the event handler`);
        }

        this._deviceEventHandlers.set(eventName, eventHandler);

        return this;
    }

    onEvent(eventName, eventHandler, warningOnOverride) {
        if ( warningOnOverride && this._eventHandler.has(eventName) ) {
            outputLogger.warn(`Event ${eventName} exists, you will override the event handler`);
        }

        this._eventHandlers.set(eventName, eventHandler);

        return this;
    }
}

WechatServer.createServer = options => {
    return new WechatServer(options);
};

function Api(appId, appSecret, getToken, saveToken) {
    if ( getToken == undefined ) {
        this.api = new WechatApi(appId, appSecret);
    }
    else if ( saveToken == undefined ) {
        this.api = new WechatApi(appId, appSecret, getToken);
    }
    else {
        this.api = new WechatApi(appId, appSecret, getToken, saveToken);
    }
}

Api.prototype.syncCall = function() {
    let methodName = arguments[0];
    let newArguments = [];
    for ( let index in arguments ) {
        if ( index != 0 ) {
            newArguments.push(arguments[index]);
        }
    }

    let api = this.api;
    let fiber = Fiber.current;

    let error = null;
    let result = null;
    newArguments.push(function(asyncErr, asyncResult) {
        error = asyncErr;
        result = asyncResult;
        fiber.run();
    });

    api[methodName].apply(api, newArguments);

    Fiber.yield();

    if ( error ) {
        throw error;
    }

    return result;
}

Api.prototype.getLatestToken = function() {
    return this.syncCall('getLatestToken');
}

Api.prototype.createMenu = function(menu) {
    return this.syncCall('createMenu', menu);
}

Api.prototype.getMenu = function() {
    return this.syncCall('getMenu');
}

Api.prototype.removeMenu = function() {
    return this.syncCall('removeMenu');
}

Api.prototype.getJsConfig = function(param) {
    console.log('jsconfig');
    let jsConfig = null;
    let error = null;
    this.api.getJsConfig(param, (err, result) => {
        error = err;
        jsConfig = result;
    });

    if ( error ) {
        throw error;
    }

    return jsConfig;
}

Api.prototype.getTicket = function() {
    console.log('ticket');
    return this.syncCall('getTicket');
}

Api.prototype.createTmpQRCode = function(sceneId, expire) {
    return this.syncCall('createTmpQRCode', sceneId, expire);
}

Api.prototype.createLimitQRCode = function(sceneId) {
    return this.syncCall('createLimitQRCode', sceneId);
}

Api.prototype.showQRCodeUrl = function(ticket) {
    return this.api.showQRCodeURL(ticket);
}

Api.prototype.getShortUrl = function(longUrl) {
    return this.syncCall('shorturl', longUrl);
}

Api.prototype.sendText = function(openId, text) {
    return this.syncCall('sendText', openId, text);
}

Api.prototype.sendArticles = function(openId, articles) {
    return this.syncCall('sendNews', openId, articles);
}

Api.prototype.sendTemplate = function(openId, templateId, url, topColor, data) {
    return this.syncCall('sendTemplate', openId, templateId, url, topColor, data);
}

Api.prototype.massSendNews = function(mediaId, receivers) {
    return this.syncCall('massSendNews', mediaId, receivers);
}

Api.prototype.getMaterialCount = function() {
    return this.syncCall('getMaterialCount');
}

Api.prototype.getMaterials = function(type, offset, count) {
    return this.syncCall('getMaterials', type, offset, count);
}

Api.prototype.getUser = function(openId) {
    return this.syncCall('getUser', {
        openid: openId,
        lang: 'zh_CN'
    });
}

let tokenFileName = __dirname + '/../../data/access_token.txt';
let GlobalApi = new Api(config.wechat.basic.appId,
    config.wechat.basic.appSecret, function(callback) {
        fs.readFile(tokenFileName, 'utf8', function(err, txt) {
            if ( err ) {
                return callback(err);
            }
            callback(null, JSON.parse(txt));
        });
    }, function(token, callback) {
        fs.writeFile(tokenFileName, JSON.stringify(token), callback);
    }
);

function getApi() {
    return GlobalApi;
}

function getAuthUserInfo(authInfo) {
    let api = getApi();

    let userInfo = api.getUser(authInfo.openId);
    console.log('User Info: ', userInfo);

    return {
        authInfo: authInfo,
        userInfo: userInfo
    };
}

function makeAuthUrl(redirectUrl) {
    let authorizeConfig = wechatConfig.authorize;
    let encodedUrl = encodeURIComponent(redirectUrl);

    return util.format(authorizeConfig.urlTemplate,
        wechatConfig.basic.appId,
        encodedUrl,
        authorizeConfig.responseType,
        authorizeConfig.scope,
        authorizeConfig.state);
}

function getAuthToken(code) {
    let path = util.format(wechatConfig.authToken.urlTemplates.get,
            wechatConfig.basic.appId, wechatConfig.appSecret, code);

    console.log(path);
    let options = {
        hostname: wechatConfig.api.host,
        port: 443,
        path: path,
        method: 'GET'
    };

    let responseContent = https.get(options);
    let response = JSON.parse(responseContent);

    let accessToken = response.access_token;
    let openId = response.openid;

    outputLogger.info('get accessToken: ' + accessToken);
    outputLogger.info('get openId: ' + openId);

    let result = {
        accessToken: accessToken,
        openId: openId
    };

    return result;
}

function calcJsConfigSignature(ticket, url, jsConfig) {
    var urlIndex = url.indexOf('#');
    if ( urlIndex != -1 ) {
        url = url.slice(0, urlIndex);
    }
    console.log(url);

    var params = [
        { field: 'jsapi_ticket', value: ticket },
        { field: 'noncestr', value: jsConfig.nonceStr },
        { field: 'timestamp', value: jsConfig.timestamp },
        { field: 'url', value: url },
    ];
    console.log(params);
    var paramList = params.reduce(function(prev, next) {
        prev.push(`${next.field}=${next.value}`);

        return prev;
    }, []);

    var string1 = paramList.join('&');
    var signature = lib.security.sha1(string1);
    jsConfig.signature = signature;
    jsConfig.beta = true;

    console.log(signature);
}

module.exports = {
    getApi: getApi,
    getAuthUserInfo: getAuthUserInfo,
    getAuthToken: getAuthToken,
    WechatServer: WechatServer,
    makeAuthUrl: makeAuthUrl,
    calcJsConfigSignature: calcJsConfigSignature
};
