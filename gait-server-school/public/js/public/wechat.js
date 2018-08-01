'use strict';

var Wechat = (function() {
    
    //test server
    //var AppId = 'wx9b4fd59b4151d755';
    //var SecureHost = 'http://test.measurex.top';
    
    //real server
    //var AppId = 'wx074f85b5c9a23c96';
    //var SecureHost = 'http://wechat.measurex.top';

    function login(onSuccess, onError) {

        var queryString = window.location.search; 
        if ( queryString ) {
            var parameters = HttpRequest.parseQueryString(queryString);
            var code = parameters.code;

            if ( !code ) {
                LoginResult.error = 'No token';
                alert('未解析到code');
                return;
            }
            var loginHttpRequest = new HttpRequest('/wechat/login', {
                code: code
            });
            loginHttpRequest.getJSON(function(result) {
                if ( result.successful )  {
                    if ( onSuccess ) {
                        onSuccess(result.data);
                    }
                }
                else {
                    onError(result.error);
                }
            }, function(err) {
                alert('微信登录失败，请退出后重新打开此微信号');
                if ( onError ) {
                    onError(result);
                }
            });
        }
    } 

    function applyJsConfig(success, error) {
        var request = new HttpRequest('/wechat/wxconfig');

        request.postJSON({
            url: window.location.href
        },
        function(result) {
            //alert(JSON.stringify(result));
            if ( result && result.successful ) {
                var jsConfig = result.data.jsConfig;

                wx.config(jsConfig);
                wx.ready(function() {
                    wx.hideAllNonBaseMenuItem();

                    if ( success ) {
                        success();
                    }
                });
                wx.error(function(res) {
                    if ( error ) {
                        error(res);
                    }
                });
            }
            else {
                if ( error ) {
                    error(result.error);
                }
            }
        });
    }

    function makeAuthUrl(redirectUrl) {
        redirectUrl = SecureHost + redirectUrl;
        var encodedUrl = encodeURIComponent(redirectUrl);

        var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?' +
        'appid=' + AppId + '&redirect_uri=' + encodedUrl +
        '&response_type=code&scope=snsapi_base&state=aiesec#wechat_redirecturl';
        
        return url;
    }

    return {
        login: login,
        applyJsConfig: applyJsConfig,
        makeAuthUrl: makeAuthUrl
    };
})();

