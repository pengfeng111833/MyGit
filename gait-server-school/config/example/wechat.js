'use strict'

module.exports = {
    basic: {
        // 微信 server token
        token: '',
        // 微信 appId
        //appId: 'wx2521a58f44d7ea16',
        appId: '',
    },
    // 微信密钥
    appSecret: '',
    api: {
        host: 'api.weixin.qq.com'
    },
    authorize: {
        urlTemplate: 'https://open.weixin.qq.com/connect/oauth2/authorize?' +
            'appid=%s&redirect_uri=%s&response_type=%s&scope=%s&state=%s#wechat_redirecturl',
        responseType: 'code',
        scope: 'snsapi_userinfo',
        state: 'aiesec'
    },
    authToken: {
        urlTemplates: {
            get: '/sns/oauth2/access_token?' +
                'appid=%s&secret=%s&code=%s&grant_type=authorization_code'
        }
    },
    authUserInfo: {
        urlTemplate: '/sns/userinfo?' +
            'access_token=%s&openid=%s&lang=zh_CN'
    },
    messages: {
        normal: '您好',
        subscribe:
          [{
            title: '欢迎关注 AIESEC 全球机会平台',
            description: '给你的大学一次精彩的实践体验',
            picurl: 'http://mmbiz.qpic.cn/mmbiz_jpg/2ZVicorw5ajWOibK6Za8SFXw4hsWKkD7w4PZdia0AHrhT5wKSuox2afxKDicSncoToJLCQvDnaNCggLyCN1J3cLH3A/0?wx_fmt=jpeg',
            url: 'http://mp.weixin.qq.com/s?__biz=MzIyNzA0ODczMg==&mid=100000025&idx=1&sn=d94f0386fa15f270bb328b7d5f4a391a#rd'
        }]
        ,
        unsubscribe: '退出'
    },
    js: {
        debug: false,
        jsApiList: [
            'closeWindow',
            'chooseWXPay',
            'onMenuShareTimeline',
            'onMenuShareAppMessage',
            'onMenuShareQQ',
            'onMenuShareWeibo',
            'onMenuShareQZone',
            'hideMenuItems',
            'hideAllNonBaseMenuItem',
            'showMenuItems'
        ],
    },
    payment: {
        mchId: '1270692901',
        notifyUrl: 'http://z.gewuit.com/wechat/pay/notify',
        certPath: 'certs/apiclient_cert.pem',
        partnerKey: '8n1BWyfBC6Kc3uK37ogxpl47f9vt1YgE'
    },
    server: {
        host: 'webapp.aiesec.cn',
        port: 80
    },
    service: {
        urlTemplate: 'http://%s/%s'
    },
    tokenServer: {
        interval: 60 * 60 * 2 * 1000
    },
    menu: {
        refreshInterval: 2 * 60 * 60 * 1000,
        button: [{
            name: '海外志愿者',
            sub_button: [{
                  type:'media_id',
                  name: '项目介绍',
                  media_id: 'l_rxwsUr1McLrbb6aH30ar_fWflAOU7RfjdoNgJFRyI',
              },{
                type: 'auth_view',
                name: '项目浏览',
                url: '/spa_modules/index.html?programme=GCDP'
            }]
        }]
    }
};
