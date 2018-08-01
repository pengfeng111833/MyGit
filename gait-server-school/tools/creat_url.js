 'use strict'
 
const createFiber = require('fibers');
const config = require('../config');

function main() {
	let redirectUrl = '/pages/complete-personal-information.html';
	const url = makeAuthUrl(redirectUrl);
	console.log('url',url);
}
 
 function makeAuthUrl(redirectUrl) {
	var SecureHost = 'http://wechat.measurex.top';
    redirectUrl = SecureHost + redirectUrl;
    var encodedUrl = encodeURIComponent(redirectUrl);

    var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?' +
    'appid=' + config.wechat.basic.appId + '&redirect_uri=' + encodedUrl +
    '&response_type=code&scope=snsapi_userinfo&state=aiesec#wechat_redirecturl';
    
    return url;
}
createFiber(main).run();
