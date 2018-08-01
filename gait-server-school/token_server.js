'use strict'

let fs = require('fs');
let config = require('./config');
let loggers = require('./modules/lib/loggers');
let outputLogger = loggers.output;

// Middlewares
let WechatAPI = require('wechat-api');

let api = new WechatAPI(config.wechat.basic.appId,
    config.wechat.appSecret);

setInterval(refreshToken, config.wechat.tokenServer.interval);

let tokenFileName = __dirname + '/data/access_token.txt';
function refreshToken() {
    outputLogger.info('Refresh token');
    
    api.getLatestToken((err, token) => {
        if ( err ) {
            outputLogger.error(err);
            return;
        }

        let tokenJSON = JSON.stringify(token);
        fs.writeFile(tokenFileName, tokenJSON, () => {
            outputLogger.info('Get new token: ' + tokenJSON);
        });
    });
}

console.log('Wechat tokenServer started');
refreshToken();
